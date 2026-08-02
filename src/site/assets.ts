export const PAGE_STYLES = ['article', 'blog', 'error', 'home', 'sponsors', 'works'] as const;

export type PageStyle = (typeof PAGE_STYLES)[number];

export type SiteAssets = {
	base: string;
	client: string;
	homeInline?: {
		base: string;
		page: string;
	};
	/**
	 * Stylesheet hrefs for each post-colocated island, keyed by the module id
	 * that `data-ox-island` carries.
	 *
	 * Hrefs rather than rendered tags because a page can use several islands
	 * that share a chunk, and the duplicates have to be dropped at render time.
	 */
	islands: Record<string, string[]>;
	pages: Record<PageStyle, string>;
	preloads?: Partial<Record<PageStyle, string>>;
	tweet: string;
};

// In development the client entry also imports these stylesheets as JS
// modules, but that injection happens after first paint and causes a flash of
// unstyled (light) content on every reload. Blocking <link> tags make the dev
// server paint styled pages immediately, matching production; Vite serves the
// CSS sources directly because stylesheet requests carry `Accept: text/css`.
export const DEV_ASSETS = {
	base: '<link rel="stylesheet" href="/src/styles/fonts.css">\n\t<link rel="stylesheet" href="/src/site/style.css">',
	client: '<script type="module" src="/src/site/client.ts"></script>',
	pages: {
		article: '<link rel="stylesheet" href="/src/site/styles/article.css">',
		blog: '<link rel="stylesheet" href="/src/site/styles/blog.css">',
		error: '<link rel="stylesheet" href="/src/site/styles/error.css">',
		home: '<link rel="stylesheet" href="/src/site/styles/home.css">',
		sponsors: '<link rel="stylesheet" href="/src/site/styles/sponsors.css">',
		works: '<link rel="stylesheet" href="/src/site/styles/works.css">',
	},
	islands: {},
	preloads: {},
	tweet: '',
} as const satisfies SiteAssets;

export type ManifestChunk = {
	css?: string[];
	file: string;
	imports?: string[];
};

/** Prefix every island module id carries in the Vite manifest. */
const ISLAND_SOURCE_PREFIX = 'packages/content/src/blog/';

/**
 * Collects the stylesheets a chunk needs, including those of the chunks it
 * statically imports.
 *
 * An island's own `css` entry only covers its own `<style>` block, so a chart
 * built from child components would otherwise ship without their styles.
 */
function chunkStyles(
	manifest: Record<string, ManifestChunk>,
	source: string,
	seen = new Set<string>(),
): string[] {
	if (seen.has(source)) {
		return [];
	}
	seen.add(source);

	const chunk = manifest[source];
	if (chunk == null) {
		return [];
	}

	return [
		...(chunk.css ?? []),
		...(chunk.imports ?? []).flatMap((imported) => chunkStyles(manifest, imported, seen)),
	];
}

/**
 * Reads the island module ids a rendered page mounts.
 *
 * @param html - Rendered page or post markup.
 * @returns Module ids as they appear on the island placeholders.
 * @example
 * islandModuleIds('<div data-ox-island="post/Chart.svelte"></div>');
 * // ['post/Chart.svelte']
 */
export function islandModuleIds(html: string): string[] {
	return [...new Set([...html.matchAll(/data-ox-island="([^"]*)"/g)].map((match) => match[1]))];
}

export function resolveSiteAssets(
	index: string,
	manifest: Record<string, ManifestChunk>,
): SiteAssets {
	const base = [...index.matchAll(/<link[^>]*rel="stylesheet"[^>]*>/g)]
		.map((match) => match[0])
		.join('\n\t');
	const client = [...index.matchAll(/<script[^>]*type="module"[^>]*><\/script>/g)]
		.map((match) => match[0])
		.join('\n\t');
	const stylesFor = (suffix: string): string => {
		const chunk = Object.entries(manifest).find(([source]) => source.endsWith(suffix))?.[1];
		const styles = chunk?.css ?? (chunk?.file.endsWith('.css') === true ? [chunk.file] : []);
		if (styles.length === 0) {
			throw new Error(`Missing CSS for ${suffix}`);
		}
		return styles.map((href) => `<link rel="stylesheet" crossorigin href="/${href}">`).join('\n\t');
	};
	const preloadFonts = (suffixes: string[]): string =>
		suffixes
			.map((suffix) => {
				const chunk = Object.entries(manifest).find(([source]) => source.endsWith(suffix))?.[1];
				if (chunk == null) {
					throw new Error(`Missing font asset for ${suffix}`);
				}
				return `<link rel="preload" href="/${chunk.file}" as="font" type="font/woff2" crossorigin>`;
			})
			.join('\n\t');

	const islands = Object.fromEntries(
		Object.keys(manifest)
			.filter((source) => source.startsWith(ISLAND_SOURCE_PREFIX) && source.endsWith('.svelte'))
			.map((source) => [
				source.slice(ISLAND_SOURCE_PREFIX.length),
				[...new Set(chunkStyles(manifest, source))],
			]),
	);

	return {
		base,
		client,
		islands,
		pages: {
			article: stylesFor('/styles/article.css'),
			blog: stylesFor('/styles/blog.css'),
			error: stylesFor('/styles/error.css'),
			home: stylesFor('/styles/home.css'),
			sponsors: stylesFor('/styles/sponsors.css'),
			works: stylesFor('/styles/works.css'),
		},
		preloads: {
			works: preloadFonts(['dm-mono-latin-400-normal.woff2', 'dm-mono-latin-500-normal.woff2']),
		},
		tweet: stylesFor('/Tweet.svelte'),
	};
}

function inlineStyle(css: string, attribute: string): string {
	return `<style ${attribute}>${css.replaceAll('</style', '<\\/style')}</style>`;
}

export function inlineHomeStyles(assets: SiteAssets, base: string, page: string): SiteAssets {
	return {
		...assets,
		homeInline: {
			base: inlineStyle(base, 'data-inline-base-style'),
			page: inlineStyle(page, 'data-inline-page-style="home"'),
		},
	};
}

/**
 * Renders the stylesheets for the islands a page mounts.
 *
 * Islands are server-rendered, so without these the markup is in the page but
 * its styles only arrive with the island's JS chunk — the finished chart would
 * never paint for a reader without JavaScript.
 */
function renderIslandStyles(assets: SiteAssets, islands: string[]): string {
	const hrefs = new Set(islands.flatMap((moduleId) => assets.islands[moduleId] ?? []));
	return [...hrefs]
		.map((href) => {
			// Development hrefs carry Vite's query string, and `&lang.css` reads as a
			// character reference unless the ampersand is escaped.
			const escaped = href.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
			return `<link rel="stylesheet" crossorigin href="/${escaped}">`;
		})
		.join('\n\t');
}

export function renderAssetTags(
	assets: SiteAssets,
	style: PageStyle,
	tweet: boolean,
	islands: string[] = [],
): string {
	const inline = style === 'home' ? assets.homeInline : undefined;
	return [
		assets.preloads?.[style] ?? '',
		inline?.base ?? assets.base,
		inline?.page ?? assets.pages[style],
		tweet ? assets.tweet : '',
		renderIslandStyles(assets, islands),
		assets.client,
	]
		.filter(Boolean)
		.join('\n\t');
}

if (import.meta.vitest != null) {
	const assets = {
		base: '<link href="/base.css"><script src="/client.js"></script>',
		client: '<script type="module" src="/client.js"></script>',
		islands: {
			'post/Chart.svelte': ['assets/Chart.css', 'assets/Legend.css'],
			'post/Table.svelte': ['assets/Legend.css'],
		},
		pages: {
			article: '<link href="/article.css">',
			blog: '<link href="/blog.css">',
			error: '<link href="/error.css">',
			home: '<link href="/home.css">',
			sponsors: '<link href="/sponsors.css">',
			works: '<link href="/works.css">',
		},
		preloads: {},
		tweet: '<link href="/tweet.css">',
	} as const satisfies SiteAssets;

	describe(resolveSiteAssets, () => {
		it('separates base, page and tweet assets from the Vite manifest', () => {
			const result = resolveSiteAssets(
				'<link rel="stylesheet" href="/base.css"><script type="module" src="/client.js"></script>',
				{
					'src/site/styles/article.css': {
						file: 'assets/article.css',
					},
					'src/site/styles/blog.css': {
						file: 'assets/blog.css',
					},
					'src/site/styles/error.css': {
						file: 'assets/error.css',
					},
					'src/site/styles/home.css': {
						file: 'assets/home.css',
					},
					'src/site/styles/sponsors.css': {
						file: 'assets/sponsors.css',
					},
					'src/site/styles/works.css': {
						file: 'assets/works.css',
					},
					'packages/content/src/Tweet.svelte': {
						file: 'assets/Tweet.js',
						css: ['assets/Tweet.css'],
					},
					'packages/content/src/blog/post/Chart.svelte': {
						file: 'assets/Chart.js',
						css: ['assets/Chart.css'],
						imports: ['_Legend.js'],
					},
					'_Legend.js': {
						file: 'assets/Legend.js',
						css: ['assets/Legend.css'],
					},
					'node_modules/@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff2': {
						file: 'assets/dm-mono-400.woff2',
					},
					'node_modules/@fontsource/dm-mono/files/dm-mono-latin-500-normal.woff2': {
						file: 'assets/dm-mono-500.woff2',
					},
				},
			);

			expect(result).toEqual({
				base: '<link rel="stylesheet" href="/base.css">',
				client: '<script type="module" src="/client.js"></script>',
				islands: {
					'post/Chart.svelte': ['assets/Chart.css', 'assets/Legend.css'],
				},
				pages: {
					article: '<link rel="stylesheet" crossorigin href="/assets/article.css">',
					blog: '<link rel="stylesheet" crossorigin href="/assets/blog.css">',
					error: '<link rel="stylesheet" crossorigin href="/assets/error.css">',
					home: '<link rel="stylesheet" crossorigin href="/assets/home.css">',
					sponsors: '<link rel="stylesheet" crossorigin href="/assets/sponsors.css">',
					works: '<link rel="stylesheet" crossorigin href="/assets/works.css">',
				},
				preloads: {
					works:
						'<link rel="preload" href="/assets/dm-mono-400.woff2" as="font" type="font/woff2" crossorigin>\n\t<link rel="preload" href="/assets/dm-mono-500.woff2" as="font" type="font/woff2" crossorigin>',
				},
				tweet: '<link rel="stylesheet" crossorigin href="/assets/Tweet.css">',
			});
		});
	});

	describe(renderAssetTags, () => {
		it('includes preloads only for the current page style', () => {
			const withPreloads = {
				...assets,
				preloads: { works: '<link rel="preload" href="/dm-mono.woff2">' },
			};

			expect(renderAssetTags(withPreloads, 'works', false)).toContain('/dm-mono.woff2');
			expect(renderAssetTags(withPreloads, 'home', false)).not.toContain('/dm-mono.woff2');
		});

		it('includes Tweet styles only when the page embeds a Tweet', () => {
			expect(renderAssetTags(assets, 'article', false)).not.toContain('/tweet.css');
			expect(renderAssetTags(assets, 'article', true)).toContain('/tweet.css');
		});

		it('links the styles of the islands the page mounts', () => {
			const tags = renderAssetTags(assets, 'article', false, ['post/Chart.svelte']);

			expect(tags).toContain('<link rel="stylesheet" crossorigin href="/assets/Chart.css">');
			expect(tags).toContain('<link rel="stylesheet" crossorigin href="/assets/Legend.css">');
		});

		it('links a shared island stylesheet once', () => {
			const tags = renderAssetTags(assets, 'article', false, [
				'post/Chart.svelte',
				'post/Table.svelte',
			]);

			expect(tags.match(/assets\/Legend\.css/g)).toHaveLength(1);
		});

		it('escapes the query string of a development island stylesheet', () => {
			const dev = {
				...assets,
				islands: { 'post/Chart.svelte': ['post/Chart.svelte?svelte&lang.css'] },
			};

			expect(renderAssetTags(dev, 'article', false, ['post/Chart.svelte'])).toContain(
				'href="/post/Chart.svelte?svelte&amp;lang.css"',
			);
		});

		it('omits island styles for a page without islands', () => {
			expect(renderAssetTags(assets, 'article', false)).not.toContain('/assets/Chart.css');
		});

		it('ignores an island with no styles of its own', () => {
			expect(renderAssetTags(assets, 'article', false, ['post/Unknown.svelte'])).not.toContain(
				'/assets/',
			);
		});
	});

	describe(islandModuleIds, () => {
		it('reads the module ids off island placeholders', () => {
			const html =
				'<div data-ox-island="post/Chart.svelte"></div><div data-ox-island="post/Table.svelte"></div>';

			expect(islandModuleIds(html)).toEqual(['post/Chart.svelte', 'post/Table.svelte']);
		});

		it('reports a repeated island once', () => {
			const html =
				'<div data-ox-island="post/Chart.svelte"></div><div data-ox-island="post/Chart.svelte"></div>';

			expect(islandModuleIds(html)).toEqual(['post/Chart.svelte']);
		});

		it('returns nothing for markup without islands', () => {
			expect(islandModuleIds('<p>plain</p>')).toEqual([]);
		});
	});

	describe(inlineHomeStyles, () => {
		it('inlines home styles without changing other page assets', () => {
			const inlined = inlineHomeStyles(
				assets,
				'body { color: red }',
				'.home::after { content: "</style>" }',
			);

			expect(renderAssetTags(inlined, 'home', false)).toContain(
				'<style data-inline-base-style>body { color: red }</style>',
			);
			expect(renderAssetTags(inlined, 'home', false)).toContain('<\\/style>');
			expect(renderAssetTags(inlined, 'home', false)).not.toContain('/home.css');
			expect(renderAssetTags(inlined, 'blog', false)).toContain('/base.css');
			expect(renderAssetTags(inlined, 'blog', false)).toContain('/blog.css');
		});
	});
}

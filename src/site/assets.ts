import { OX_CONTENT_ASSET_MANIFEST } from './ox-content.ts';
import { type PageStyle } from './page-style.ts';

export type { PageStyle } from './page-style.ts';

export type SiteAssets = {
	base: string;
	client: string;
	oxContent: string;
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
};

// In development the client entry also imports the site stylesheets as JS
// modules, but that injection happens after first paint and causes a flash of
// unstyled (light) content on every reload. Blocking <link> tags make the dev
// server paint styled pages immediately, matching production; Vite serves the
// CSS sources directly because stylesheet requests carry `Accept: text/css`.
export const DEV_ASSETS = {
	base: [
		'<link rel="stylesheet" href="/src/site/style.css">',
		'<link rel="stylesheet" href="/src/site/components/Shell/Shell.module.css">',
	].join('\n'),
	client: '<script type="module" src="/src/site/client.ts"></script>',
	oxContent: OX_CONTENT_ASSET_MANIFEST.headTags,
	pages: {
		about: '<link rel="stylesheet" href="/src/site/pages/about/About.module.css">',
		article: [
			'<link rel="stylesheet" href="/src/site/pages/blog/article/page.css">',
			'<link rel="stylesheet" href="/src/site/pages/blog/article/Article.module.css">',
		].join('\n'),
		blog: '<link rel="stylesheet" href="/src/site/pages/blog/BlogList.module.css">',
		error: '<link rel="stylesheet" href="/src/site/pages/error/Error.module.css">',
		home: '<link rel="stylesheet" href="/src/site/pages/home/Home.module.css">',
		sponsors: '<link rel="stylesheet" href="/src/site/pages/sponsors/Sponsors.module.css">',
		works: [
			'<link rel="stylesheet" href="/src/site/pages/works/page.css">',
			'<link rel="stylesheet" href="/src/site/pages/works/_components/WorksNav/WorksNav.module.css">',
			'<link rel="stylesheet" href="/src/site/pages/works/_components/WorksSection/WorksSection.module.css">',
			'<link rel="stylesheet" href="/src/site/pages/works/media/Media.module.css">',
			'<link rel="stylesheet" href="/src/site/pages/works/oss/Oss.module.css">',
			'<link rel="stylesheet" href="/src/site/pages/works/publications/Publications.module.css">',
			'<link rel="stylesheet" href="/src/site/pages/works/showcase/Showcase.module.css">',
			'<link rel="stylesheet" href="/src/site/pages/works/talks/Talks.module.css">',
		].join('\n'),
	},
	islands: {},
} as const satisfies SiteAssets;

export type ManifestChunk = {
	css?: string[];
	file: string;
	imports?: string[];
};

/** Prefix every island module id carries in the Vite manifest. */
const ISLAND_SOURCE_PREFIX = 'src/content/blog/';

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
 * islandModuleIds('<div data-ox-island="post/Chart.tsx"></div>');
 * // ['post/Chart.tsx']
 */
export function islandModuleIds(html: string): string[] {
	return [...new Set([...html.matchAll(/data-ox-island="([^"]*)"/g)].map((match) => match[1]))];
}

export function resolveSiteAssets(
	index: string,
	manifest: Record<string, ManifestChunk>,
): SiteAssets {
	const indexStyles = [...index.matchAll(/<link[^>]*rel="stylesheet"[^>]*>/g)]
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
	const stylesForAll = (suffixes: readonly string[]): string =>
		suffixes.map((suffix) => stylesFor(suffix)).join('\n\t');
	const base = [indexStyles, stylesFor('/components/Shell/Shell.module.css')]
		.filter(Boolean)
		.join('\n\t');
	const islands = Object.fromEntries(
		Object.keys(manifest)
			.filter((source) => source.startsWith(ISLAND_SOURCE_PREFIX) && source.endsWith('.tsx'))
			.map((source) => [
				source.slice(ISLAND_SOURCE_PREFIX.length),
				[...new Set(chunkStyles(manifest, source))],
			]),
	);

	return {
		base,
		client,
		oxContent: OX_CONTENT_ASSET_MANIFEST.headTags,
		islands,
		pages: {
			about: stylesFor('/pages/about/About.module.css'),
			article: stylesForAll([
				'/pages/blog/article/page.css',
				'/pages/blog/article/Article.module.css',
			]),
			blog: stylesFor('/pages/blog/BlogList.module.css'),
			error: stylesFor('/pages/error/Error.module.css'),
			home: stylesFor('/pages/home/Home.module.css'),
			sponsors: stylesFor('/pages/sponsors/Sponsors.module.css'),
			works: stylesForAll([
				'/pages/works/page.css',
				'/pages/works/_components/WorksNav/WorksNav.module.css',
				'/pages/works/_components/WorksSection/WorksSection.module.css',
				'/pages/works/media/Media.module.css',
				'/pages/works/oss/Oss.module.css',
				'/pages/works/publications/Publications.module.css',
				'/pages/works/showcase/Showcase.module.css',
				'/pages/works/talks/Talks.module.css',
			]),
		},
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
	islands: string[] = [],
): string {
	const inline = style === 'home' ? assets.homeInline : undefined;
	return [
		assets.oxContent,
		inline?.base ?? assets.base,
		inline?.page ?? assets.pages[style],
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
		oxContent:
			'<link rel="stylesheet" href="/__ox_icons__/icons.css">\n<link rel="stylesheet" href="/__ox_fonts__/fonts.css">',
		islands: {
			'post/Chart.tsx': ['assets/Chart.css', 'assets/Legend.css'],
			'post/Table.tsx': ['assets/Legend.css'],
		},
		pages: {
			about: '<link href="/about-page.css">',
			article: '<link href="/article.css">',
			blog: '<link href="/blog.css">',
			error: '<link href="/error.css">',
			home: '<link href="/home.css">',
			sponsors: '<link href="/sponsors.css">',
			works: '<link href="/works.css">',
		},
	} as const satisfies SiteAssets;

	describe(resolveSiteAssets, () => {
		it('separates base and page assets from the Vite manifest', () => {
			const result = resolveSiteAssets(
				'<link rel="stylesheet" href="/base.css"><script type="module" src="/client.js"></script>',
				{
					'src/site/components/Shell/Shell.module.css': {
						file: 'assets/shell.css',
					},
					'src/site/pages/about/About.module.css': {
						file: 'assets/about-page.css',
					},
					'src/site/pages/blog/article/page.css': {
						file: 'assets/article-global.css',
					},
					'src/site/pages/blog/article/Article.module.css': {
						file: 'assets/article.css',
					},
					'src/site/pages/blog/BlogList.module.css': {
						file: 'assets/blog.css',
					},
					'src/site/pages/error/Error.module.css': {
						file: 'assets/error.css',
					},
					'src/site/pages/home/Home.module.css': {
						file: 'assets/home.css',
					},
					'src/site/pages/sponsors/Sponsors.module.css': {
						file: 'assets/sponsors.css',
					},
					'src/site/pages/works/page.css': {
						file: 'assets/works-global.css',
					},
					'src/site/pages/works/_components/WorksNav/WorksNav.module.css': {
						file: 'assets/works-nav.css',
					},
					'src/site/pages/works/_components/WorksSection/WorksSection.module.css': {
						file: 'assets/works-section.css',
					},
					'src/site/pages/works/media/Media.module.css': {
						file: 'assets/media.css',
					},
					'src/site/pages/works/oss/Oss.module.css': {
						file: 'assets/oss.css',
					},
					'src/site/pages/works/publications/Publications.module.css': {
						file: 'assets/publications.css',
					},
					'src/site/pages/works/showcase/Showcase.module.css': {
						file: 'assets/showcase.css',
					},
					'src/site/pages/works/talks/Talks.module.css': {
						file: 'assets/talks.css',
					},
					'src/content/blog/post/Chart.tsx': {
						file: 'assets/Chart.js',
						css: ['assets/Chart.css'],
						imports: ['_Legend.js'],
					},
					'_Legend.js': {
						file: 'assets/Legend.js',
						css: ['assets/Legend.css'],
					},
				},
			);

			expect(result).toEqual({
				base: '<link rel="stylesheet" href="/base.css">\n\t<link rel="stylesheet" crossorigin href="/assets/shell.css">',
				client: '<script type="module" src="/client.js"></script>',
				oxContent: OX_CONTENT_ASSET_MANIFEST.headTags,
				islands: {
					'post/Chart.tsx': ['assets/Chart.css', 'assets/Legend.css'],
				},
				pages: {
					about: '<link rel="stylesheet" crossorigin href="/assets/about-page.css">',
					article:
						'<link rel="stylesheet" crossorigin href="/assets/article-global.css">\n\t<link rel="stylesheet" crossorigin href="/assets/article.css">',
					blog: '<link rel="stylesheet" crossorigin href="/assets/blog.css">',
					error: '<link rel="stylesheet" crossorigin href="/assets/error.css">',
					home: '<link rel="stylesheet" crossorigin href="/assets/home.css">',
					sponsors: '<link rel="stylesheet" crossorigin href="/assets/sponsors.css">',
					works:
						'<link rel="stylesheet" crossorigin href="/assets/works-global.css">\n\t<link rel="stylesheet" crossorigin href="/assets/works-nav.css">\n\t<link rel="stylesheet" crossorigin href="/assets/works-section.css">\n\t<link rel="stylesheet" crossorigin href="/assets/media.css">\n\t<link rel="stylesheet" crossorigin href="/assets/oss.css">\n\t<link rel="stylesheet" crossorigin href="/assets/publications.css">\n\t<link rel="stylesheet" crossorigin href="/assets/showcase.css">\n\t<link rel="stylesheet" crossorigin href="/assets/talks.css">',
				},
			});
		});
	});

	describe(renderAssetTags, () => {
		it('links the styles of the islands the page mounts', () => {
			const tags = renderAssetTags(assets, 'article', ['post/Chart.tsx']);

			expect(tags).toContain('<link rel="stylesheet" crossorigin href="/assets/Chart.css">');
			expect(tags).toContain('<link rel="stylesheet" crossorigin href="/assets/Legend.css">');
		});

		it('links a shared island stylesheet once', () => {
			const tags = renderAssetTags(assets, 'article', ['post/Chart.tsx', 'post/Table.tsx']);

			expect(tags.match(/assets\/Legend\.css/g)).toHaveLength(1);
		});

		it('escapes the query string of a development island stylesheet', () => {
			const dev = {
				...assets,
				islands: { 'post/Chart.tsx': ['post/Chart.css?direct&lang.css'] },
			};

			expect(renderAssetTags(dev, 'article', ['post/Chart.tsx'])).toContain(
				'href="/post/Chart.css?direct&amp;lang.css"',
			);
		});

		it('omits island styles for a page without islands', () => {
			expect(renderAssetTags(assets, 'article')).not.toContain('/assets/Chart.css');
		});

		it('ignores an island with no styles of its own', () => {
			expect(renderAssetTags(assets, 'article', ['post/Unknown.tsx'])).not.toContain('/assets/');
		});
	});

	describe(islandModuleIds, () => {
		it('reads the module ids off island placeholders', () => {
			const html =
				'<div data-ox-island="post/Chart.tsx"></div><div data-ox-island="post/Table.tsx"></div>';

			expect(islandModuleIds(html)).toEqual(['post/Chart.tsx', 'post/Table.tsx']);
		});

		it('reports a repeated island once', () => {
			const html =
				'<div data-ox-island="post/Chart.tsx"></div><div data-ox-island="post/Chart.tsx"></div>';

			expect(islandModuleIds(html)).toEqual(['post/Chart.tsx']);
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

			expect(renderAssetTags(inlined, 'home')).toContain(
				'<style data-inline-base-style>body { color: red }</style>',
			);
			expect(renderAssetTags(inlined, 'home')).toContain('<\\/style>');
			expect(renderAssetTags(inlined, 'home')).not.toContain('/home.css');
			expect(renderAssetTags(inlined, 'blog')).toContain('/base.css');
			expect(renderAssetTags(inlined, 'blog')).toContain('/blog.css');
		});
	});
}

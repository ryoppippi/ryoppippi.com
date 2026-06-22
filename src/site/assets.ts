export const PAGE_STYLES = ['article', 'blog', 'error', 'home', 'sponsors', 'works'] as const;

export type PageStyle = (typeof PAGE_STYLES)[number];

export type SiteAssets = {
	base: string;
	client: string;
	homeInline?: {
		base: string;
		page: string;
	};
	pages: Record<PageStyle, string>;
	tweet: string;
};

export const DEV_ASSETS = {
	base: '',
	client: '<script type="module" src="/src/site/client.ts"></script>',
	pages: {
		article: '',
		blog: '',
		error: '',
		home: '',
		sponsors: '',
		works: '',
	},
	tweet: '',
} as const satisfies SiteAssets;

type ManifestChunk = {
	css?: string[];
	file: string;
};

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

	return {
		base,
		client,
		pages: {
			article: stylesFor('/styles/article.css'),
			blog: stylesFor('/styles/blog.css'),
			error: stylesFor('/styles/error.css'),
			home: stylesFor('/styles/home.css'),
			sponsors: stylesFor('/styles/sponsors.css'),
			works: stylesFor('/styles/works.css'),
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

export function renderAssetTags(assets: SiteAssets, style: PageStyle, tweet: boolean): string {
	const inline = style === 'home' ? assets.homeInline : undefined;
	return [
		inline?.base ?? assets.base,
		inline?.page ?? assets.pages[style],
		tweet ? assets.tweet : '',
		assets.client,
	]
		.filter(Boolean)
		.join('\n\t');
}

if (import.meta.vitest != null) {
	const assets = {
		base: '<link href="/base.css"><script src="/client.js"></script>',
		client: '<script type="module" src="/client.js"></script>',
		pages: {
			article: '<link href="/article.css">',
			blog: '<link href="/blog.css">',
			error: '<link href="/error.css">',
			home: '<link href="/home.css">',
			sponsors: '<link href="/sponsors.css">',
			works: '<link href="/works.css">',
		},
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
				},
			);

			expect(result).toEqual({
				base: '<link rel="stylesheet" href="/base.css">',
				client: '<script type="module" src="/client.js"></script>',
				pages: {
					article: '<link rel="stylesheet" crossorigin href="/assets/article.css">',
					blog: '<link rel="stylesheet" crossorigin href="/assets/blog.css">',
					error: '<link rel="stylesheet" crossorigin href="/assets/error.css">',
					home: '<link rel="stylesheet" crossorigin href="/assets/home.css">',
					sponsors: '<link rel="stylesheet" crossorigin href="/assets/sponsors.css">',
					works: '<link rel="stylesheet" crossorigin href="/assets/works.css">',
				},
				tweet: '<link rel="stylesheet" crossorigin href="/assets/Tweet.css">',
			});
		});
	});

	describe(renderAssetTags, () => {
		it('includes Tweet styles only when the page embeds a Tweet', () => {
			expect(renderAssetTags(assets, 'article', false)).not.toContain('/tweet.css');
			expect(renderAssetTags(assets, 'article', true)).toContain('/tweet.css');
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

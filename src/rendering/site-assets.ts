import { resolveSolidIslandStylesheets } from '@ox-content/vite-plugin-solid';
import { withoutLeadingSlash } from 'ufo';
import {
	renderDocumentAssets,
	renderDocumentAssetTag,
} from '@ox-content/vite-plugin/document-assets';
import { OX_CONTENT_ASSET_MANIFEST } from '@/config/ox-content.ts';
import { type PageStyle } from '@/client/page-style-registry.ts';

export type { PageStyle } from '@/client/page-style-registry.ts';

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
	pageStyles: Record<PageStyle, string>;
};

// In development the client entry also imports the site stylesheets as JS
// modules, but that injection happens after first paint and causes a flash of
// unstyled (light) content on every reload. Blocking <link> tags make the dev
// server paint styled pages immediately, matching production; Vite serves the
// CSS sources directly because stylesheet requests carry `Accept: text/css`.
export const DEV_ASSETS = {
	base: [
		'<link rel="stylesheet" href="/src/styles/global.css">',
		'<link rel="stylesheet" href="/src/components/SiteLayout/SiteLayout.module.css">',
	].join('\n'),
	client: '<script type="module" src="/src/client/index.ts"></script>',
	oxContent: OX_CONTENT_ASSET_MANIFEST.headTags,
	pageStyles: {
		about: '<link rel="stylesheet" href="/src/pages/about/About.module.css">',
		article: [
			'<link rel="stylesheet" href="/src/pages/blog/article/ArticleContent.css">',
			'<link rel="stylesheet" href="/src/pages/blog/article/Article.module.css">',
		].join('\n'),
		blog: '<link rel="stylesheet" href="/src/pages/blog/BlogList.module.css">',
		error: '<link rel="stylesheet" href="/src/pages/error/Error.module.css">',
		home: '<link rel="stylesheet" href="/src/pages/home/Home.module.css">',
		sponsors: '<link rel="stylesheet" href="/src/pages/sponsors/Sponsors.module.css">',
		works: [
			'<link rel="stylesheet" href="/src/pages/works/WorksProse.css">',
			'<link rel="stylesheet" href="/src/pages/works/_components/WorksNav/WorksNav.module.css">',
			'<link rel="stylesheet" href="/src/pages/works/_components/WorksSection/WorksSection.module.css">',
			'<link rel="stylesheet" href="/src/pages/works/media/Media.module.css">',
			'<link rel="stylesheet" href="/src/pages/works/oss/Oss.module.css">',
			'<link rel="stylesheet" href="/src/pages/works/publications/Publications.module.css">',
			'<link rel="stylesheet" href="/src/pages/works/showcase/Showcase.module.css">',
			'<link rel="stylesheet" href="/src/pages/works/talks/Talks.module.css">',
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
 * Reads the island module ids a rendered page mounts.
 *
 * @param html - Rendered page or post markup.
 * @returns Module ids as they appear on the island placeholders.
 * @example
 * islandModuleIds('<div data-ox-module="/src/content/blog/post/Chart.tsx"></div>');
 * // ['post/Chart.tsx']
 */
export function islandModuleIds(html: string): string[] {
	return [
		...new Set(
			[...html.matchAll(/data-ox-module="\/src\/content\/blog\/([^"]*)"/g)].map(
				(match) => match[1],
			),
		),
	];
}

export function resolveSiteAssets(manifest: Record<string, ManifestChunk>): SiteAssets {
	const entry = renderDocumentAssets({
		manifest,
		clientEntries: ['index.html'],
		crossorigin: true,
	});
	const indexStyles = entry.styles.map(renderDocumentAssetTag).join('\n\t');
	const client = entry.scripts.map(renderDocumentAssetTag).join('\n\t');
	const stylesFor = (suffix: string): string => {
		const chunk = Object.entries(manifest).find(([source]) => source.endsWith(suffix))?.[1];
		const styles = chunk?.css ?? (chunk?.file.endsWith('.css') === true ? [chunk.file] : []);
		if (styles.length === 0) {
			throw new Error(`Missing CSS for ${suffix}`);
		}
		return renderDocumentAssets({
			pageStyles: styles.map((href) => ({ href, crossorigin: true })),
		}).headHtml;
	};
	const stylesForAll = (suffixes: readonly string[]): string =>
		suffixes.map((suffix) => stylesFor(suffix)).join('\n\t');
	const base = [indexStyles, stylesFor('/components/SiteLayout/SiteLayout.module.css')]
		.filter(Boolean)
		.join('\n\t');
	const islands = Object.fromEntries(
		Object.keys(manifest)
			.filter((source) => source.startsWith(ISLAND_SOURCE_PREFIX) && source.endsWith('.tsx'))
			.map((source) => {
				const result = resolveSolidIslandStylesheets({ modules: [source], manifest });
				if (result.diagnostics.length > 0) {
					throw new Error(result.diagnostics.map(({ message }) => message).join('\n'));
				}
				return [
					source.slice(ISLAND_SOURCE_PREFIX.length),
					result.stylesheets.map(({ href }) => withoutLeadingSlash(href)),
				];
			}),
	);

	return {
		base,
		client,
		oxContent: OX_CONTENT_ASSET_MANIFEST.headTags,
		islands,
		pageStyles: {
			about: stylesFor('/pages/about/About.module.css'),
			article: stylesForAll([
				'/pages/blog/article/ArticleContent.css',
				'/pages/blog/article/Article.module.css',
			]),
			blog: stylesFor('/pages/blog/BlogList.module.css'),
			error: stylesFor('/pages/error/Error.module.css'),
			home: stylesFor('/pages/home/Home.module.css'),
			sponsors: stylesFor('/pages/sponsors/Sponsors.module.css'),
			works: stylesForAll([
				'/pages/works/WorksProse.css',
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

export function inlineHomeStyles(assets: SiteAssets, base: string, page: string): SiteAssets {
	return {
		...assets,
		homeInline: {
			base: renderDocumentAssetTag({
				kind: 'style',
				content: base,
				attrs: { 'data-inline-base-style': true },
			}),
			page: renderDocumentAssetTag({
				kind: 'style',
				content: page,
				attrs: { 'data-inline-page-style': 'home' },
			}),
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
	return renderDocumentAssets({
		islandStyles: islands
			.flatMap((moduleId) => assets.islands[moduleId] ?? [])
			.map((href) => ({ href, crossorigin: true })),
	}).headHtml;
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
		inline?.page ?? assets.pageStyles[style],
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
		pageStyles: {
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
		it('rejects unresolved island stylesheet dependencies', () => {
			expect(() =>
				resolveSiteAssets({
					'src/components/SiteLayout/SiteLayout.module.css': { file: 'layout.css' },
					'src/content/blog/post/Chart.tsx': { file: 'chart.js', imports: ['missing-dependency'] },
				}),
			).toThrow('missing-dependency');
		});
		it('separates base and page assets from the Vite manifest', () => {
			const result = resolveSiteAssets({
				'index.html': { file: 'client.js', css: ['base.css'] },
				'src/components/SiteLayout/SiteLayout.module.css': {
					file: 'assets/site-layout.css',
				},
				'src/pages/about/About.module.css': {
					file: 'assets/about-page.css',
				},
				'src/pages/blog/article/ArticleContent.css': {
					file: 'assets/article-global.css',
				},
				'src/pages/blog/article/Article.module.css': {
					file: 'assets/article.css',
				},
				'src/pages/blog/BlogList.module.css': {
					file: 'assets/blog.css',
				},
				'src/pages/error/Error.module.css': {
					file: 'assets/error.css',
				},
				'src/pages/home/Home.module.css': {
					file: 'assets/home.css',
				},
				'src/pages/sponsors/Sponsors.module.css': {
					file: 'assets/sponsors.css',
				},
				'src/pages/works/WorksProse.css': {
					file: 'assets/works-global.css',
				},
				'src/pages/works/_components/WorksNav/WorksNav.module.css': {
					file: 'assets/works-nav.css',
				},
				'src/pages/works/_components/WorksSection/WorksSection.module.css': {
					file: 'assets/works-section.css',
				},
				'src/pages/works/media/Media.module.css': {
					file: 'assets/media.css',
				},
				'src/pages/works/oss/Oss.module.css': {
					file: 'assets/oss.css',
				},
				'src/pages/works/publications/Publications.module.css': {
					file: 'assets/publications.css',
				},
				'src/pages/works/showcase/Showcase.module.css': {
					file: 'assets/showcase.css',
				},
				'src/pages/works/talks/Talks.module.css': {
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
			});

			expect(result).toEqual({
				base: '<link rel="stylesheet" href="/base.css">\n\t<link rel="stylesheet" href="/assets/site-layout.css" crossorigin>',
				client: '<script type="module" src="/client.js" crossorigin></script>',
				oxContent: OX_CONTENT_ASSET_MANIFEST.headTags,
				islands: {
					'post/Chart.tsx': ['assets/Legend.css', 'assets/Chart.css'],
				},
				pageStyles: {
					about: '<link rel="stylesheet" href="/assets/about-page.css" crossorigin>',
					article:
						'<link rel="stylesheet" href="/assets/article-global.css" crossorigin>\n\t<link rel="stylesheet" href="/assets/article.css" crossorigin>',
					blog: '<link rel="stylesheet" href="/assets/blog.css" crossorigin>',
					error: '<link rel="stylesheet" href="/assets/error.css" crossorigin>',
					home: '<link rel="stylesheet" href="/assets/home.css" crossorigin>',
					sponsors: '<link rel="stylesheet" href="/assets/sponsors.css" crossorigin>',
					works:
						'<link rel="stylesheet" href="/assets/works-global.css" crossorigin>\n\t<link rel="stylesheet" href="/assets/works-nav.css" crossorigin>\n\t<link rel="stylesheet" href="/assets/works-section.css" crossorigin>\n\t<link rel="stylesheet" href="/assets/media.css" crossorigin>\n\t<link rel="stylesheet" href="/assets/oss.css" crossorigin>\n\t<link rel="stylesheet" href="/assets/publications.css" crossorigin>\n\t<link rel="stylesheet" href="/assets/showcase.css" crossorigin>\n\t<link rel="stylesheet" href="/assets/talks.css" crossorigin>',
				},
			});
		});
	});

	describe(renderAssetTags, () => {
		it('links the styles of the islands the page mounts', () => {
			const tags = renderAssetTags(assets, 'article', ['post/Chart.tsx']);

			expect(tags).toContain('<link rel="stylesheet" href="/assets/Chart.css" crossorigin>');
			expect(tags).toContain('<link rel="stylesheet" href="/assets/Legend.css" crossorigin>');
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
				'<div data-ox-module="/src/content/blog/post/Chart.tsx"></div><div data-ox-module="/src/content/blog/post/Table.tsx"></div>';

			expect(islandModuleIds(html)).toEqual(['post/Chart.tsx', 'post/Table.tsx']);
		});

		it('reports a repeated island once', () => {
			const html =
				'<div data-ox-module="/src/content/blog/post/Chart.tsx"></div><div data-ox-module="/src/content/blog/post/Chart.tsx"></div>';

			expect(islandModuleIds(html)).toEqual(['post/Chart.tsx']);
		});

		it('returns nothing for markup without islands', () => {
			expect(islandModuleIds('<p>plain</p>')).toEqual([]);
		});
	});

	describe(inlineHomeStyles, () => {
		it('inlines home styles without changing other page assets', () => {
			const inlined = inlineHomeStyles(assets, 'body { color: red }', '.home { color: blue }');

			expect(renderAssetTags(inlined, 'home')).toContain(
				'<style data-inline-base-style>body { color: red }</style>',
			);
			expect(renderAssetTags(inlined, 'home')).toContain('.home { color: blue }');
			expect(renderAssetTags(inlined, 'home')).not.toContain('/home.css');
			expect(renderAssetTags(inlined, 'blog')).toContain('/base.css');
			expect(renderAssetTags(inlined, 'blog')).toContain('/blog.css');
		});
	});
}

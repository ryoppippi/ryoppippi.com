import { resolveSolidIslandStylesheets } from '@ox-content/vite-plugin-solid';
import {
	type DocumentScriptInput,
	type DocumentSelfHostedAssets,
	type DocumentStyleDescriptor,
	type DocumentStylesheetInput,
	renderDocumentAssets,
} from '@ox-content/vite-plugin/document-assets';
import { OX_CONTENT_ASSET_MANIFEST, SYNTAX_THEME_HREF } from '@/config/ox-content.ts';
import { type PageStyle } from '@/client/page-style-registry.ts';

export type { PageStyle } from '@/client/page-style-registry.ts';

/** Structured assets selected by the site before final document-level composition. */
export type SiteAssets = {
	sharedStyles: readonly DocumentStylesheetInput[];
	scripts: readonly DocumentScriptInput[];
	selfHosted: DocumentSelfHostedAssets;
	homeInline?: {
		sharedStyles: readonly DocumentStylesheetInput[];
		pageStyles: readonly DocumentStylesheetInput[];
	};
	/**
	 * Stylesheet hrefs for each post-colocated island, keyed by the module id
	 * that `data-ox-island` carries.
	 *
	 * Hrefs rather than rendered tags because a page can use several islands
	 * that share a chunk, and the duplicates have to be dropped at render time.
	 */
	islands: Record<string, readonly DocumentStylesheetInput[]>;
	pageStyles: Record<PageStyle, readonly DocumentStylesheetInput[]>;
};

// In development the client entry also imports the site stylesheets as JS
// modules, but that injection happens after first paint and causes a flash of
// unstyled (light) content on every reload. Blocking <link> tags make the dev
// server paint styled pages immediately, matching production; Vite serves the
// CSS sources directly because stylesheet requests carry `Accept: text/css`.
export const DEV_ASSETS = {
	sharedStyles: ['/src/styles/global.css', '/src/components/SiteLayout/SiteLayout.module.css'],
	scripts: ['/src/client/index.ts'],
	selfHosted: OX_CONTENT_ASSET_MANIFEST,
	pageStyles: {
		about: ['/src/pages/about/About.module.css'],
		article: [
			'/src/pages/blog/article/ArticleContent.css',
			'/src/pages/blog/article/Article.module.css',
		],
		blog: ['/src/pages/blog/BlogList.module.css'],
		error: ['/src/pages/error/Error.module.css'],
		home: ['/src/pages/home/Home.module.css'],
		sponsors: ['/src/pages/sponsors/Sponsors.module.css'],
		works: [
			'/src/pages/works/WorksProse.css',
			'/src/pages/works/_components/WorksNav/WorksNav.module.css',
			'/src/pages/works/_components/WorksSection/WorksSection.module.css',
			'/src/pages/works/media/Media.module.css',
			'/src/pages/works/oss/Oss.module.css',
			'/src/pages/works/publications/Publications.module.css',
			'/src/pages/works/showcase/Showcase.module.css',
			'/src/pages/works/talks/Talks.module.css',
		],
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
 * Resolves production site assets from the Vite manifest without serializing page fragments.
 *
 * @param manifest - Vite client build manifest.
 * @returns Structured shared, route, island, self-hosted, and client assets.
 */
export function resolveSiteAssets(manifest: Record<string, ManifestChunk>): SiteAssets {
	const entry = renderDocumentAssets({
		manifest,
		clientEntries: ['index.html'],
		crossorigin: true,
	});
	const stylesFor = (suffix: string): DocumentStyleDescriptor[] => {
		const chunk = Object.entries(manifest).find(([source]) => source.endsWith(suffix))?.[1];
		const styles = chunk?.css ?? (chunk?.file.endsWith('.css') === true ? [chunk.file] : []);
		if (styles.length === 0) {
			throw new Error(`Missing CSS for ${suffix}`);
		}
		return styles.map((href) => ({ kind: 'style', href, crossorigin: true }));
	};
	const stylesForAll = (suffixes: readonly string[]): DocumentStyleDescriptor[] =>
		suffixes.flatMap((suffix) => stylesFor(suffix));
	const islands = Object.fromEntries(
		Object.keys(manifest)
			.filter((source) => source.startsWith(ISLAND_SOURCE_PREFIX) && source.endsWith('.tsx'))
			.map((source) => {
				const result = resolveSolidIslandStylesheets({ modules: [source], manifest });
				if (result.diagnostics.length > 0) {
					throw new Error(result.diagnostics.map(({ message }) => message).join('\n'));
				}
				return [
					`/${source}`,
					result.stylesheets.map(
						({ href }) => ({ href, crossorigin: true }) satisfies DocumentStylesheetInput,
					),
				];
			}),
	);

	return {
		sharedStyles: [...entry.styles, ...stylesFor('/components/SiteLayout/SiteLayout.module.css')],
		scripts: entry.scripts,
		selfHosted: OX_CONTENT_ASSET_MANIFEST,
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

/**
 * Replaces the home page stylesheet links with critical inline CSS descriptors.
 *
 * @param assets - Resolved site assets.
 * @param base - Shared critical CSS content.
 * @param page - Home-page critical CSS content.
 * @returns Site assets with home-only inline style selection.
 */
export function inlineHomeStyles(assets: SiteAssets, base: string, page: string): SiteAssets {
	return {
		...assets,
		homeInline: {
			sharedStyles: [
				{
					kind: 'style',
					content: base,
					attrs: { 'data-inline-base-style': true },
				},
			],
			pageStyles: [
				{
					kind: 'style',
					content: page,
					attrs: { 'data-inline-page-style': 'home' },
				},
			],
		},
	};
}

/**
 * Renders one deduplicated asset list for a complete page.
 *
 * Island styles participate in the same document-level pass because their SSR
 * markup must paint even when the client script never runs.
 *
 * @param assets - Resolved shared, route, island, and client assets.
 * @param style - Site-owned page style selection.
 * @param islands - Client module ids mounted by the rendered page.
 * @returns Head tags in document order with duplicate assets removed.
 */
export function renderAssetTags(
	assets: SiteAssets,
	style: PageStyle,
	islands: string[] = [],
): string {
	const inline = style === 'home' ? assets.homeInline : undefined;
	return renderDocumentAssets({
		selfHostedAssets: assets.selfHosted,
		sharedStyles: inline?.sharedStyles ?? assets.sharedStyles,
		pageStyles: [
			...(inline?.pageStyles ?? assets.pageStyles[style]),
			...(style === 'article' ? [SYNTAX_THEME_HREF] : []),
		],
		islandStyles: islands.flatMap((moduleId) => assets.islands[moduleId] ?? []),
		scripts: assets.scripts,
	}).headHtml;
}

if (import.meta.vitest != null) {
	const assets = {
		sharedStyles: ['/base.css'],
		scripts: ['/client.js'],
		selfHosted: OX_CONTENT_ASSET_MANIFEST,
		islands: {
			'/src/content/blog/post/Chart.tsx': [
				{ href: 'assets/Chart.css', crossorigin: true },
				{ href: 'assets/Legend.css', crossorigin: true },
			],
			'/src/content/blog/post/Table.tsx': [{ href: 'assets/Legend.css', crossorigin: true }],
		},
		pageStyles: {
			about: ['/about-page.css'],
			article: ['/article.css'],
			blog: ['/blog.css'],
			error: ['/error.css'],
			home: ['/home.css'],
			sponsors: ['/sponsors.css'],
			works: ['/works.css'],
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

			expect(result.sharedStyles).toEqual([
				{ kind: 'style', href: '/base.css' },
				{ kind: 'style', href: 'assets/site-layout.css', crossorigin: true },
			]);
			expect(result.scripts).toEqual([
				{ kind: 'script', src: '/client.js', type: 'module', crossorigin: true },
			]);
			expect(result.islands['/src/content/blog/post/Chart.tsx']).toEqual([
				{ href: '/assets/Legend.css', crossorigin: true },
				{ href: '/assets/Chart.css', crossorigin: true },
			]);
			expect(result.pageStyles.article).toEqual([
				{ kind: 'style', href: 'assets/article-global.css', crossorigin: true },
				{ kind: 'style', href: 'assets/article.css', crossorigin: true },
			]);
			expect(result.pageStyles.works).toHaveLength(8);
		});
	});

	describe(renderAssetTags, () => {
		it('loads syntax theme tokens only for article pages', () => {
			expect(renderAssetTags(assets, 'article')).toContain('/__ox_theme_tokens__/syntax.css');
			expect(renderAssetTags(assets, 'home')).not.toContain('/__ox_theme_tokens__/syntax.css');
		});
		it('links the styles of the islands the page mounts', () => {
			const tags = renderAssetTags(assets, 'article', ['/src/content/blog/post/Chart.tsx']);

			expect(tags).toContain('<link rel="stylesheet" href="/assets/Chart.css" crossorigin>');
			expect(tags).toContain('<link rel="stylesheet" href="/assets/Legend.css" crossorigin>');
		});

		it('emits a stylesheet shared by document sections once', () => {
			const sharedHref = '/assets/shared.css';
			const duplicated = {
				...assets,
				sharedStyles: [sharedHref],
				islands: { '/src/content/blog/post/Chart.tsx': [sharedHref] },
				pageStyles: { ...assets.pageStyles, article: [sharedHref] },
			};

			const tags = renderAssetTags(duplicated, 'article', ['/src/content/blog/post/Chart.tsx']);

			expect(Array.from(tags.matchAll(new RegExp(sharedHref, 'g')))).toHaveLength(1);
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

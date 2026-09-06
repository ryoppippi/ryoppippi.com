import {
	type DocumentScriptInput,
	type DocumentSelfHostedAssets,
	type DocumentLinkInput,
	type DocumentStyleDescriptor,
	type DocumentStylesheetInput,
	renderDocumentAssets,
} from '@ox-content/vite-plugin/document-assets';
import type { OxContentCustomHostAssetsContext } from '@ox-content/vite-plugin/custom-host';
import { PAGE_STYLE_MODULES, type PageStyle } from '@/client/page-style-registry.ts';

export type { PageStyle } from '@/client/page-style-registry.ts';

/** Structured assets selected by the site before final document-level composition. */
export type SiteAssets = {
	sharedStyles: readonly DocumentStylesheetInput[];
	scripts: readonly DocumentScriptInput[];
	selfHosted: DocumentSelfHostedAssets;
	syntaxThemeHref?: string;
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
type SiteAssetResolver = Pick<
	OxContentCustomHostAssetsContext,
	'document' | 'selfHosted' | 'stylesheets' | 'themeTokens'
>;

/**
 * Resolves development assets from the same custom-host context used in production.
 *
 * @param assets - Ox Content's development asset context.
 * @returns Blocking source stylesheets plus framework-owned generated assets.
 */
export function resolveDevSiteAssets(assets: SiteAssetResolver): SiteAssets {
	return {
		sharedStyles: ['/src/styles/global.css', '/src/components/SiteLayout/SiteLayout.module.css'],
		scripts: ['/src/client/index.ts'],
		selfHosted: assets.selfHosted,
		syntaxThemeHref: assets.themeTokens?.href,
		pageStyles: PAGE_STYLE_MODULES,
		islands: {},
	};
}

function moduleStyles(
	assets: SiteAssetResolver,
	modules: readonly string[],
): DocumentStyleDescriptor[] {
	const result = assets.stylesheets({ modules });
	if (result.diagnostics.length > 0) {
		throw new Error(result.diagnostics.map(({ message }) => message).join('\n'));
	}
	return result.stylesheets.map(({ moduleId: _moduleId, ...style }) => ({
		...style,
		crossorigin: true,
	}));
}

/**
 * Resolves production site assets from the Vite manifest without serialising page fragments.
 *
 * @param assets - Ox Content's build-aware document and stylesheet resolver.
 * @param islandModules - Browser module ids mounted by published articles.
 * @returns Structured shared, route, island, self-hosted, and client assets.
 */
export function resolveSiteAssets(
	assets: SiteAssetResolver,
	islandModules: readonly string[] = [],
): SiteAssets {
	const entry = assets.document({ clientEntries: ['index.html'], crossorigin: true });
	const islands = Object.fromEntries(
		islandModules.map((moduleId) => [moduleId, moduleStyles(assets, [moduleId])]),
	);

	return {
		sharedStyles: [
			...entry.styles,
			...moduleStyles(assets, ['/src/components/SiteLayout/SiteLayout.module.css']),
		],
		scripts: entry.scripts,
		selfHosted: assets.selfHosted,
		syntaxThemeHref: assets.themeTokens?.href,
		islands,
		pageStyles: {
			about: moduleStyles(assets, PAGE_STYLE_MODULES.about),
			article: moduleStyles(assets, PAGE_STYLE_MODULES.article),
			blog: moduleStyles(assets, PAGE_STYLE_MODULES.blog),
			error: moduleStyles(assets, PAGE_STYLE_MODULES.error),
			home: moduleStyles(assets, PAGE_STYLE_MODULES.home),
			sponsors: moduleStyles(assets, PAGE_STYLE_MODULES.sponsors),
			works: moduleStyles(assets, PAGE_STYLE_MODULES.works),
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
 * @param links - Additional links selected by the rendered page.
 * @returns Head tags in document order with duplicate assets removed.
 */
export function renderAssetTags(
	assets: SiteAssets,
	style: PageStyle,
	islands: string[] = [],
	links: readonly DocumentLinkInput[] = [],
): string {
	const inline = style === 'home' ? assets.homeInline : undefined;
	return renderDocumentAssets({
		links,
		selfHostedAssets: assets.selfHosted,
		sharedStyles: inline?.sharedStyles ?? assets.sharedStyles,
		pageStyles: [
			...(inline?.pageStyles ?? assets.pageStyles[style]),
			...(style === 'article' && assets.syntaxThemeHref != null ? [assets.syntaxThemeHref] : []),
		],
		islandStyles: islands.flatMap((moduleId) => assets.islands[moduleId] ?? []),
		scripts: assets.scripts,
	}).headHtml;
}

if (import.meta.vitest != null) {
	const testSelfHosted = { stylesheets: [], preloads: [], headTags: '' };
	const assets = {
		sharedStyles: ['/base.css'],
		scripts: ['/client.js'],
		selfHosted: testSelfHosted,
		syntaxThemeHref: '/__ox_theme_tokens__/syntax.css',
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
		const stylesByModule = {
			'/src/components/SiteLayout/SiteLayout.module.css': ['/assets/site-layout.css'],
			'/src/pages/about/About.module.css': ['/assets/about-page.css'],
			'/src/pages/blog/article/ArticleContent.css': ['/assets/article-global.css'],
			'/src/pages/blog/article/Article.module.css': ['/assets/article.css'],
			'/src/pages/blog/BlogList.module.css': ['/assets/blog.css'],
			'/src/pages/error/Error.module.css': ['/assets/error.css'],
			'/src/pages/home/Home.module.css': ['/assets/home.css'],
			'/src/pages/sponsors/Sponsors.module.css': ['/assets/sponsors.css'],
			'/src/pages/works/WorksProse.css': ['/assets/works-global.css'],
			'/src/pages/works/_components/WorksNav/WorksNav.module.css': ['/assets/works-nav.css'],
			'/src/pages/works/_components/WorksSection/WorksSection.module.css': [
				'/assets/works-section.css',
			],
			'/src/pages/works/media/Media.module.css': ['/assets/media.css'],
			'/src/pages/works/oss/Oss.module.css': ['/assets/oss.css'],
			'/src/pages/works/publications/Publications.module.css': ['/assets/publications.css'],
			'/src/pages/works/showcase/Showcase.module.css': ['/assets/showcase.css'],
			'/src/pages/works/talks/Talks.module.css': ['/assets/talks.css'],
			'/src/content/blog/post/Chart.tsx': ['/assets/Legend.css', '/assets/Chart.css'],
		} as const satisfies Record<string, readonly string[]>;

		function createTestAssetResolver(missing: ReadonlySet<string> = new Set()): SiteAssetResolver {
			return {
				selfHosted: testSelfHosted,
				themeTokens: { href: '/__ox_theme_tokens__/syntax.css', outputPath: '', css: '' },
				document: (input) =>
					renderDocumentAssets({
						...input,
						manifest: { 'index.html': { file: 'client.js', css: ['base.css'] } },
					}),
				stylesheets: ({ modules }) => ({
					stylesheets: modules.flatMap((moduleId) =>
						missing.has(moduleId)
							? []
							: (stylesByModule[moduleId as keyof typeof stylesByModule] ?? []).map((href) => ({
									kind: 'style' as const,
									href,
									moduleId,
								})),
					),
					diagnostics: modules
						.filter((moduleId) => missing.has(moduleId))
						.map((moduleId) => ({
							code: 'missing-module' as const,
							moduleId,
							message: `Missing ${moduleId}`,
						})),
					dependencies: [],
				}),
			};
		}

		it('rejects unresolved island stylesheet dependencies', () => {
			expect(() =>
				resolveSiteAssets(createTestAssetResolver(new Set(['/src/content/blog/post/Chart.tsx'])), [
					'/src/content/blog/post/Chart.tsx',
				]),
			).toThrow('Missing /src/content/blog/post/Chart.tsx');
		});
		it('separates base and page assets from the custom host resolver', () => {
			const result = resolveSiteAssets(createTestAssetResolver(), [
				'/src/content/blog/post/Chart.tsx',
			]);

			expect(result.sharedStyles).toEqual([
				{ kind: 'style', href: '/base.css' },
				{ kind: 'style', href: '/assets/site-layout.css', crossorigin: true },
			]);
			expect(result.scripts).toEqual([
				{ kind: 'script', src: '/client.js', type: 'module', crossorigin: true },
			]);
			expect(result.islands['/src/content/blog/post/Chart.tsx']).toEqual([
				{ kind: 'style', href: '/assets/Legend.css', crossorigin: true },
				{ kind: 'style', href: '/assets/Chart.css', crossorigin: true },
			]);
			expect(result.pageStyles.article).toEqual([
				{ kind: 'style', href: '/assets/article-global.css', crossorigin: true },
				{ kind: 'style', href: '/assets/article.css', crossorigin: true },
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

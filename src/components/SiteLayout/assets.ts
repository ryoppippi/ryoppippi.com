import path from 'node:path';
import {
	type DocumentScriptInput,
	type DocumentSelfHostedAssets,
	type DocumentLinkInput,
	type DocumentStyleDescriptor,
	type DocumentStylesheetInput,
	renderDocumentAssets,
} from '@ox-content/vite-plugin/document-assets';
import type {
	OxContentCustomHostAssetsContext,
	OxContentCustomHostStylesheetsResult,
} from '@ox-content/vite-plugin/custom-host';

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
	pageStyles: (style: string) => readonly DocumentStylesheetInput[];
};

// In development the client entry also imports the site stylesheets as JS
// modules, but that injection happens after first paint and causes a flash of
// unstyled (light) content on every reload. Blocking <link> tags make the dev
// server paint styled pages immediately, matching production; Vite serves the
// CSS sources directly because stylesheet requests carry `Accept: text/css`.
type SiteAssetResolver = Pick<
	OxContentCustomHostAssetsContext,
	'document' | 'selfHosted' | 'stylesheets' | 'ssrStylesheets' | 'themeTokens'
>;

/**
 * Resolves development assets from the same custom-host context used in production.
 *
 * @param assets - Ox Content's development asset context.
 * @returns Blocking source stylesheets plus framework-owned generated assets.
 */
export function resolveDevSiteAssets(assets: SiteAssetResolver): SiteAssets {
	return {
		sharedStyles: [
			'/src/styles/global.css',
			...moduleStyles(assets.ssrStylesheets({ modules: ['/src/components/SiteLayout/index.tsx'] })),
		],
		scripts: ['/src/client/index.ts'],
		selfHosted: assets.selfHosted,
		syntaxThemeHref: assets.themeTokens?.href,
		pageStyles: (style) =>
			moduleStyles(
				assets.ssrStylesheets({ modules: [path.posix.join('/src/pages', style, 'page.tsx')] }),
			),
		islands: {},
	};
}

function moduleStyles(result: OxContentCustomHostStylesheetsResult): DocumentStyleDescriptor[] {
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
		islandModules.map((moduleId) => [
			moduleId,
			moduleStyles(assets.stylesheets({ modules: [moduleId] })),
		]),
	);

	return {
		sharedStyles: [
			...entry.styles,
			...moduleStyles(assets.ssrStylesheets({ modules: ['/src/components/SiteLayout/index.tsx'] })),
		],
		scripts: entry.scripts,
		selfHosted: assets.selfHosted,
		syntaxThemeHref: assets.themeTokens?.href,
		islands,
		pageStyles: (style) =>
			moduleStyles(
				assets.ssrStylesheets({ modules: [path.posix.join('/src/pages', style, 'page.tsx')] }),
			),
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
	style: string,
	islands: string[] = [],
	links: readonly DocumentLinkInput[] = [],
): string {
	const inline = style === '.' ? assets.homeInline : undefined;
	return renderDocumentAssets({
		links,
		selfHostedAssets: assets.selfHosted,
		sharedStyles: inline?.sharedStyles ?? assets.sharedStyles,
		pageStyles: [
			...(inline?.pageStyles ?? assets.pageStyles(style)),
			...(style === 'blog/[slug]' && assets.syntaxThemeHref != null
				? [assets.syntaxThemeHref]
				: []),
		],
		islandStyles: islands.flatMap((moduleId) => assets.islands[moduleId] ?? []),
		scripts: assets.scripts,
	}).headHtml;
}

if (import.meta.vitest != null) {
	const testSelfHosted = { stylesheets: [], preloads: [], headTags: '' };
	const pageStyles: Record<string, string[]> = {
		'blog/[slug]': ['/article.css'],
		blog: ['/blog.css'],
		'.': ['/home.css'],
	};
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
		pageStyles: (style) => pageStyles[style],
	} as const satisfies SiteAssets;

	test('article documents include syntax and selected island styles but home does not', async () => {
		const { renderHtmlDocument } = await import('./document.ts');
		const article = renderHtmlDocument({
			assets,
			style: 'blog/[slug]',
			title: 'Article',
			pathname: '/blog/post/',
			content: '',
			islands: ['/src/content/blog/post/Chart.tsx'],
		});
		const home = renderHtmlDocument({
			assets,
			style: '.',
			title: '',
			pathname: '/',
			content: '',
		});
		expect(article).toContain('/__ox_theme_tokens__/syntax.css');
		expect(article).toContain('href="/assets/Chart.css"');
		expect(article).toContain('href="/article.css"');
		expect(home).not.toContain('/__ox_theme_tokens__/syntax.css');
		expect(home).not.toContain('/assets/Chart.css');
		expect(home).not.toContain('/article.css');
	});

	test('home style inlining leaves other page assets unchanged', async () => {
		const { renderHtmlDocument } = await import('./document.ts');
		const inlined = inlineHomeStyles(assets, 'body { color: red }', '.home { color: blue }');
		const home = renderHtmlDocument({
			assets: inlined,
			style: '.',
			title: '',
			pathname: '/',
			content: '',
		});
		const blog = renderHtmlDocument({
			assets: inlined,
			style: 'blog',
			title: 'Blog',
			pathname: '/blog/',
			content: '',
		});

		expect(home).toContain('<style data-inline-base-style>body { color: red }</style>');
		expect(home).toContain('.home { color: blue }');
		expect(home).not.toContain('/home.css');
		expect(blog).toContain('/base.css');
		expect(blog).toContain('/blog.css');
	});
}

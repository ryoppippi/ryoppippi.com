import type { OxContentCustomHostBaseContext } from '@ox-content/vite-plugin/custom-host';
import { createSvelteHtmlHostRenderer } from '@ox-content/vite-plugin-svelte';
import {
	renderHtmlHostMarkdown,
	type HtmlHostClientModule,
	type HtmlHostMarkdownMetadata,
} from '@ox-content/vite-plugin/html-host';
import type { SiteAssets } from '@/components/SiteLayout/assets.ts';

/** Article body and browser modules selected by the upstream Svelte renderer. */
export type MarkdownRenderer = (
	source: string,
	options: { documentPath: string; contentRoot?: string },
) => Promise<{ html: string; headHtml?: string; clientModules: readonly HtmlHostClientModule[] }>;

/**
 * Supplies site article metadata through the native Markdown and Svelte SSR interfaces.
 * @param context - Native host renderer and dependency-aware module loader.
 * @param assets - Page asset selection updated with rendered island styles in development.
 * @returns The page data loader's Markdown renderer.
 */
export function createPageMarkdownRenderer(
	context: OxContentCustomHostBaseContext,
	assets?: SiteAssets,
): MarkdownRenderer {
	const renderSvelte = createSvelteHtmlHostRenderer({
		root: context.root,
		loadModule: (id) => context.loadModule(id),
	});
	return async (source, options) => {
		const result = await context.markdown.render<HtmlHostMarkdownMetadata>({
			source,
			documentPath: options.documentPath,
			convertMdLinks: false,
			renderHtml: (context) =>
				renderHtmlHostMarkdown({
					context: { ...context, contentRoot: options.contentRoot ?? context.contentRoot },
					renderIslands: renderSvelte,
					documentAssets: false,
				}),
		});
		const metadata = result.metadata;
		if (metadata != null && metadata.islandStyleDiagnostics.length > 0) {
			throw new Error(metadata.islandStyleDiagnostics.map(({ message }) => message).join('\n'));
		}
		if (assets != null && metadata != null) {
			for (const { moduleId } of metadata.clientModules) {
				assets.islands[moduleId] = metadata.islandStyles.filter(
					(style) => style.moduleId === moduleId,
				);
			}
		}
		return {
			html: result.html,
			headHtml: metadata?.headHtml,
			clientModules: result.metadata?.clientModules ?? [],
		};
	};
}

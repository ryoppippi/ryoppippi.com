import type { OxContentCustomHostBaseContext } from '@ox-content/vite-plugin/custom-host';
import { createSvelteIslandRenderer, type SvelteIslandModule } from './svelte-islands.ts';
import type { SiteAssets } from '@/components/SiteLayout/assets.ts';

/** Article body, scoped styles and browser modules selected while rendering its components. */
export type MarkdownRenderer = (
	source: string,
	options: { documentPath: string; contentRoot?: string },
) => Promise<{ html: string; head?: string; clientModules: readonly SvelteIslandModule[] }>;

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
	const renderSvelte = createSvelteIslandRenderer({
		root: context.root,
		loadModule: (id) => context.loadModule(id),
	});
	return async (source, options) => {
		const result = await context.markdown.render<{
			head: string;
			clientModules: readonly SvelteIslandModule[];
		}>({
			source,
			documentPath: options.documentPath,
			convertMdLinks: false,
			async renderHtml({ html, transform }) {
				const rendered = await renderSvelte(html, { ...options, imports: transform.imports });
				if (assets != null) {
					for (const { moduleId } of rendered.clientModules) {
						const styles = context.assets.stylesheets({ modules: [moduleId] });
						if (styles.diagnostics.length > 0)
							throw new Error(styles.diagnostics.map(({ message }) => message).join('\n'));
						assets.islands[moduleId] = styles.stylesheets;
					}
				}
				return {
					html: rendered.html,
					metadata: { head: rendered.head, clientModules: rendered.clientModules },
				};
			},
		});
		return {
			html: result.html,
			head: result.metadata?.head,
			clientModules: result.metadata?.clientModules ?? [],
		};
	};
}

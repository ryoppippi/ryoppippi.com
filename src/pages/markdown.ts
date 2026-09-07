import type { OxContentCustomHostBaseContext } from '@ox-content/vite-plugin/custom-host';
import {
	createSolidHtmlHostRenderer,
	type SolidHtmlHostClientModule,
} from '@ox-content/vite-plugin-solid';
import type { SiteAssets } from '@/components/SiteLayout/assets.ts';

/** Article body and browser modules selected while rendering its Solid components. */
export type MarkdownRenderer = (
	source: string,
	options: { documentPath: string; contentRoot?: string },
) => Promise<{ html: string; clientModules: readonly SolidHtmlHostClientModule[] }>;

/**
 * Supplies site article metadata through the native Markdown/Solid host interfaces.
 * @param context - Native host renderer and dependency-aware module loader.
 * @param assets - Page asset selection updated with rendered island styles in development.
 * @returns The page data loader's Markdown renderer.
 */
export function createPageMarkdownRenderer(
	context: OxContentCustomHostBaseContext,
	assets?: SiteAssets,
): MarkdownRenderer {
	const renderSolid = createSolidHtmlHostRenderer({
		root: context.root,
		loadModule: (id) => context.loadModule(id),
	});
	return async (source, options) => {
		const result = await context.markdown.render<readonly SolidHtmlHostClientModule[]>({
			source,
			documentPath: options.documentPath,
			convertMdLinks: false,
			async renderHtml({ html, transform }) {
				const rendered = await renderSolid(html, { ...options, imports: transform.imports });
				for (const { moduleId } of assets == null ? [] : rendered.clientModules) {
					const styles = context.assets.stylesheets({ modules: [moduleId] });
					if (styles.diagnostics.length > 0)
						throw new Error(styles.diagnostics.map(({ message }) => message).join('\n'));
					if (assets != null) assets.islands[moduleId] = styles.stylesheets;
				}
				return { html: rendered.html, metadata: rendered.clientModules };
			},
		});
		return { html: result.html, clientModules: result.metadata ?? [] };
	};
}

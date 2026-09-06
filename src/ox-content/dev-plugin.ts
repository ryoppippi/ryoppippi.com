import {
	createOxContentCustomHostPlugin,
	type OxContentCustomHostOptions,
	type OxContentCustomHostModule,
	type OxContentCustomHostRoute,
	type OxContentCustomHostRenderContext,
	type OxContentCustomHostRoutesContext,
} from '@ox-content/vite-plugin/custom-host';
import type { DocumentStylesheetInput } from '@ox-content/vite-plugin/document-assets';
import type { MarkdownRenderer } from './markdown.ts';

/** Request-local Markdown rendering and the styles discovered while rendering islands. */
export type MarkdownDevContext = OxContentCustomHostRenderContext & {
	renderMarkdown: MarkdownRenderer;
	islandStylesheets: Record<string, readonly DocumentStylesheetInput[]>;
};

/** A native route with access to the plugin's Markdown rendering context. */
export type MarkdownDevRoute = Omit<OxContentCustomHostRoute, 'render'> & {
	render: (context: MarkdownDevContext) => ReturnType<OxContentCustomHostRoute['render']>;
};

/** Site routes and response policy; Vite and Markdown/Solid wiring belong to the plugin. */
export type MarkdownDevHost = Pick<OxContentCustomHostModule, 'notFound'> & {
	routes: (
		context: OxContentCustomHostRoutesContext,
	) => readonly MarkdownDevRoute[] | Promise<readonly MarkdownDevRoute[]>;
};

type MarkdownDevPluginOptions = Omit<OxContentCustomHostOptions, 'host'> & {
	host: string;
	markdownModule: string;
	islandRendererModule: string;
};

function createRenderContext(
	context: OxContentCustomHostRenderContext,
	markdownModule: string,
	islandRendererModule: string,
): MarkdownDevContext {
	const islandStylesheets: MarkdownDevContext['islandStylesheets'] = {};
	const renderMarkdown = (async (source, renderOptions) => {
		const [markdown, islands] = await Promise.all([
			context.loadModule(markdownModule) as Promise<typeof import('./markdown.ts')>,
			context.loadModule(islandRendererModule) as Promise<typeof import('./island-renderer.ts')>,
		]);
		const renderIsland = islands.createIslandRenderer(async (modulePath) => {
			const module = await context.loadModule(modulePath);
			const styles = context.assets.stylesheets({ modules: [modulePath] });
			if (styles.diagnostics.length > 0) {
				throw new Error(styles.diagnostics.map(({ message }) => message).join('\n'));
			}
			islandStylesheets[modulePath] = styles.stylesheets;
			return module;
		}, context.root);
		return markdown.renderMarkdown(source, { ...renderOptions, renderIsland });
	}) satisfies MarkdownRenderer;
	return { ...context, renderMarkdown, islandStylesheets };
}

/**
 * Connects a site host to lazy Markdown/Solid rendering using the native dev lifecycle.
 * @param options - Native host options and SSR module entries for the host and renderers.
 * @returns The framework-owned Vite plugin with a Markdown-aware route context.
 */
export function createMarkdownDevPlugin({
	host: hostModule,
	markdownModule,
	islandRendererModule,
	...options
}: MarkdownDevPluginOptions) {
	return createOxContentCustomHostPlugin({
		...options,
		build: { ...options.build, enabled: false },
		host: {
			async routes(context) {
				const { default: host } = (await context.loadModule(hostModule)) as {
					default: MarkdownDevHost;
				};
				return (await host.routes(context)).map(
					(route) =>
						({
							...route,
							render(context) {
								return route.render(
									createRenderContext(context, markdownModule, islandRendererModule),
								);
							},
						}) satisfies OxContentCustomHostRoute,
				);
			},
			async notFound(context) {
				const { default: host } = (await context.loadModule(hostModule)) as {
					default: MarkdownDevHost;
				};
				return host.notFound?.(context);
			},
		},
	});
}

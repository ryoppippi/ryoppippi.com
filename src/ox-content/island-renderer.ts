import type { IslandRenderer } from './markdown.ts';
import path from 'node:path';
import { renderSolidHtmlHost, toSolidHtmlHostClientModuleId } from '@ox-content/vite-plugin-solid';

const workspaceDirectory = path.resolve(import.meta.dirname, '../..');

/** Vite loader that compiles Solid modules before rendering. */
export type IslandModuleLoader = (path: string) => Promise<unknown>;

/**
 * Connects the host's Vite loader to Ox Content's Solid HTML renderer.
 *
 * @param load - Vite SSR module loader.
 * @param root - Vite project root used to produce browser module ids.
 * @returns A document renderer that fails on any upstream diagnostic.
 */
export function createIslandRenderer(
	load: IslandModuleLoader,
	root = workspaceDirectory,
): IslandRenderer {
	return async (html, context) => {
		const result = await renderSolidHtmlHost({
			html,
			...context,
			root,
			loadModule: load,
			resolveClientModule: ({ serverModuleId }) =>
				toSolidHtmlHostClientModuleId(serverModuleId, root),
		});
		if (result.diagnostics.length > 0) {
			throw new Error(result.diagnostics.map(({ message }) => message).join('\n'));
		}
		return { html: result.html, clientModules: result.clientModules };
	};
}

import type { IslandRenderer } from './markdown/render.ts';
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

if (import.meta.vitest != null) {
	const html = '<div data-ox-island="Chart"><script type="application/json">{}</script></div>';
	const context = {
		documentPath: '/workspace/src/content/blog/post/index.mdx',
		contentRoot: '/workspace/src/content/blog',
		imports: [
			{
				source: './Chart.tsx',
				specifiers: [{ imported: 'default', local: 'Chart', kind: 'default' as const }],
			},
		],
	};

	describe(createIslandRenderer, () => {
		it('rejects when the module has no component export', async () => {
			const renderIsland = createIslandRenderer(async () => ({}), '/workspace');
			await expect(renderIsland(html, context)).rejects.toThrow('export');
		});

		it('propagates module loading failures', async () => {
			const renderIsland = createIslandRenderer(
				() => Promise.reject(new Error('missing')),
				'/workspace',
			);
			await expect(renderIsland(html, context)).rejects.toThrow('missing');
		});

		it('loads the module from the content blog directory', async () => {
			const load = vi.fn(async () => ({ default: () => null }));
			await createIslandRenderer(load, '/workspace')(html, context);
			expect(load).toHaveBeenCalledWith('/workspace/src/content/blog/post/Chart.tsx');
		});

		it('renders a Solid component through the framework host contract', async () => {
			const { ssr } = await import('@solidjs/web');
			const renderIsland = createIslandRenderer(
				async () => ({ default: () => ssr('<p>solid</p>') }),
				'/workspace',
			);
			const rendered = await renderIsland(html, context);
			expect(rendered.html).toContain('<p>solid</p>');
			expect(rendered.html).toContain('data-ox-module="/src/content/blog/post/Chart.tsx"');
			expect(rendered.clientModules).toEqual([
				{ name: 'Chart', moduleId: '/src/content/blog/post/Chart.tsx', exportName: 'default' },
			]);
		});
	});
}

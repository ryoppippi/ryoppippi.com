import type { IslandRenderer } from './markdown/render.ts';
import { renderSolidHtmlHost } from '@ox-content/vite-plugin-solid';

/** Vite loader that compiles Solid modules before rendering. */
export type IslandModuleLoader = (path: string) => Promise<unknown>;

/**
 * Connects the host's Vite loader to Ox Content's Solid HTML renderer.
 *
 * @param load - Vite SSR module loader.
 * @returns A document renderer that fails on any upstream diagnostic.
 */
export function createIslandRenderer(load: IslandModuleLoader): IslandRenderer {
	return async (html, islands) => {
		const result = await renderSolidHtmlHost({
			html,
			documentPath: '/virtual/article.mdx',
			components: Object.fromEntries(
				Object.entries(islands).map(([name, moduleId]) => [name, `/src/content/blog/${moduleId}`]),
			),
			loadModule: load,
			resolveClientModule: ({ serverModuleId }) => serverModuleId,
		});
		if (result.diagnostics.length > 0) {
			throw new Error(result.diagnostics.map(({ message }) => message).join('\n'));
		}
		return result.html;
	};
}

if (import.meta.vitest != null) {
	const html = '<div data-ox-island="Chart"><script type="application/json">{}</script></div>';
	const islands = { Chart: 'post/Chart.tsx' };

	describe(createIslandRenderer, () => {
		it('rejects when the module has no component export', async () => {
			const renderIsland = createIslandRenderer(async () => ({}));
			await expect(renderIsland(html, islands)).rejects.toThrow('export');
		});

		it('propagates module loading failures', async () => {
			const renderIsland = createIslandRenderer(() => Promise.reject(new Error('missing')));
			await expect(renderIsland(html, islands)).rejects.toThrow('missing');
		});

		it('loads the module from the content blog directory', async () => {
			const load = vi.fn(async () => ({ default: () => null }));
			await createIslandRenderer(load)(html, islands);
			expect(load).toHaveBeenCalledWith('/src/content/blog/post/Chart.tsx');
		});

		it('renders a Solid component through the framework host contract', async () => {
			const { ssr } = await import('@solidjs/web');
			const renderIsland = createIslandRenderer(async () => ({
				default: () => ssr('<p>solid</p>'),
			}));
			const rendered = await renderIsland(html, islands);
			expect(rendered).toContain('<p>solid</p>');
			expect(rendered).toContain('data-ox-module="/src/content/blog/post/Chart.tsx"');
		});
	});
}

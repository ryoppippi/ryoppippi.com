import type { Component } from 'svelte';
import type { IslandRenderer } from './markdown/render.ts';
import { renderToString } from 'solid-js/web';
import { render } from 'svelte/server';

type SvelteIslandModule = { default: Component<Record<string, unknown>> };
type SolidIslandModule = { default: (props: Record<string, unknown>) => unknown };

/**
 * Loads a module by a path relative to the site source root, such as
 * `/src/content/blog/2026-07-23-post/Chart.svelte`.
 *
 * A `.svelte` or Solid `.tsx` file has to be compiled before it can be
 * rendered, so callers supply a Vite SSR loader rather than a plain dynamic
 * import.
 */
export type IslandModuleLoader = (path: string) => Promise<unknown>;

/**
 * Builds the island renderer used by the markdown pipeline to server-render
 * post-colocated components.
 *
 * The component framework is picked by extension: `.svelte` renders through
 * `svelte/server`, `.tsx` through Solid's `renderToString`.
 *
 * @param load - Vite SSR loader for paths relative to the site source root.
 * @returns A renderer that returns the component's HTML, or null when the
 * module cannot be loaded or does not export a component.
 * @example
 * const renderIsland = createIslandRenderer((path) => server.ssrLoadModule(path));
 * await renderIsland('2026-07-23-post/Chart.svelte', { bars: 3 });
 */
export function createIslandRenderer(load: IslandModuleLoader): IslandRenderer {
	const cache = new Map<string, Promise<string | null>>();

	return async (moduleId, props) => {
		const key = `${moduleId} ${JSON.stringify(props)}`;
		const cached = cache.get(key);
		if (cached != null) {
			return cached;
		}

		const pending = (async () => {
			try {
				if (moduleId.endsWith('.tsx')) {
					const module = (await load(`/src/content/blog/${moduleId}`)) as SolidIslandModule;
					if (typeof module?.default !== 'function') {
						return null;
					}

					// Solid SSR components are plain functions once compiled, so the
					// component call itself is the render.
					return renderToString(() => module.default(props));
				}

				const module = (await load(`/src/content/blog/${moduleId}`)) as SvelteIslandModule;
				if (typeof module?.default !== 'function') {
					return null;
				}

				// `head` is dropped: the markdown pipeline produces a body fragment
				// and has nowhere to put document-level markup.
				return render(module.default, { props }).body;
			} catch (error) {
				console.warn(`[islands] failed to render ${moduleId}:`, error);
				return null;
			}
		})();

		cache.set(key, pending);
		return pending;
	};
}

if (import.meta.vitest != null) {
	describe(createIslandRenderer, () => {
		it('returns null when the module has no component export', async () => {
			const renderIsland = createIslandRenderer(async () => ({ default: 'not a component' }));

			expect(await renderIsland('post/Chart.svelte', {})).toBeNull();
		});

		it('returns null when loading fails', async () => {
			const renderIsland = createIslandRenderer(() => Promise.reject(new Error('missing')));

			expect(await renderIsland('post/Chart.svelte', {})).toBeNull();
		});

		it('loads the module from the content blog directory', async () => {
			const load = vi.fn(async () => ({ default: 'not a component' }));
			const renderIsland = createIslandRenderer(load);
			await renderIsland('2026-07-23-post/Chart.svelte', {});

			expect(load).toHaveBeenCalledWith('/src/content/blog/2026-07-23-post/Chart.svelte');
		});

		it('renders a Solid component through renderToString', async () => {
			const { ssr } = await import('solid-js/web');
			const renderIsland = createIslandRenderer(async () => ({
				default: () => ssr('<p>solid</p>'),
			}));

			expect(await renderIsland('post/Chart.tsx', {})).toBe('<p>solid</p>');
		});
	});
}

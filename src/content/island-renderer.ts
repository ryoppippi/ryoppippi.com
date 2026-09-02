import type { IslandRenderer } from './markdown/render.ts';
import { renderToString } from '@solidjs/web';

type SolidIslandModule = { default: (props: Record<string, unknown>) => unknown };

/**
 * Loads a module by a path relative to the site source root, such as
 * `/src/content/blog/2026-07-23-post/Chart.tsx`.
 *
 * A Solid `.tsx` file has to be compiled before it can be rendered, so callers
 * supply a Vite SSR loader rather than a plain dynamic import.
 */
export type IslandModuleLoader = (path: string) => Promise<unknown>;

/**
 * Builds the island renderer used by the markdown pipeline to server-render
 * post-colocated components.
 *
 * @param load - Vite SSR loader for paths relative to the site source root.
 * @returns A renderer that returns the component's HTML, or null when the
 * module cannot be loaded or does not export a component.
 * @example
 * const renderIsland = createIslandRenderer((path) => server.ssrLoadModule(path));
 * await renderIsland('2026-07-23-post/Chart.tsx', { bars: 3 });
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
				const module = (await load(`/src/content/blog/${moduleId}`)) as SolidIslandModule;
				if (typeof module?.default !== 'function') {
					return null;
				}

				return renderToString(() => module.default(props));
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

			expect(await renderIsland('post/Chart.tsx', {})).toBeNull();
		});

		it('returns null when loading fails', async () => {
			const renderIsland = createIslandRenderer(() => Promise.reject(new Error('missing')));

			expect(await renderIsland('post/Chart.tsx', {})).toBeNull();
		});

		it('loads the module from the content blog directory', async () => {
			const load = vi.fn(async () => ({ default: 'not a component' }));
			const renderIsland = createIslandRenderer(load);
			await renderIsland('2026-07-23-post/Chart.tsx', {});

			expect(load).toHaveBeenCalledWith('/src/content/blog/2026-07-23-post/Chart.tsx');
		});

		it('renders a Solid component through renderToString', async () => {
			const { ssr } = await import('@solidjs/web');
			const renderIsland = createIslandRenderer(async () => ({
				default: () => ssr('<p>solid</p>'),
			}));

			expect(await renderIsland('post/Chart.tsx', {})).toBe('<p>solid</p>');
		});
	});
}

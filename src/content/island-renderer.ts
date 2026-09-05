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
 * @returns A renderer that returns component HTML and propagates loading/rendering failures.
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
			const module = (await load(`/src/content/blog/${moduleId}`)) as SolidIslandModule;
			if (typeof module?.default !== 'function') {
				throw new TypeError(`Island ${moduleId} must export a default component`);
			}
			return renderToString(() => module.default(props));
		})();

		cache.set(key, pending);
		return pending;
	};
}

if (import.meta.vitest != null) {
	describe(createIslandRenderer, () => {
		it('rejects when the module has no component export', async () => {
			const renderIsland = createIslandRenderer(async () => ({ default: 'not a component' }));

			await expect(renderIsland('post/Chart.tsx', {})).rejects.toThrow('component');
		});

		it('propagates module loading failures', async () => {
			const renderIsland = createIslandRenderer(() => Promise.reject(new Error('missing')));

			await expect(renderIsland('post/Chart.tsx', {})).rejects.toThrow('missing');
		});

		it('loads the module from the content blog directory', async () => {
			const load = vi.fn(async () => ({ default: () => null }));
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

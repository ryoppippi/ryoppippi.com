import type { Component } from 'svelte';

type IslandLoader = () => Promise<{ default: Component<Record<string, unknown>> }>;

// Every component colocated with a post is a potential island, so the loaders
// are collected by glob rather than listed by hand. Vite keeps each one in its
// own chunk, so a post only ever downloads the islands it actually uses.
const loaders = import.meta.glob('./blog/**/*.svelte') as Record<string, IslandLoader>;

/**
 * Resolves the loader for an island module id emitted into the markup by the
 * markdown pipeline.
 *
 * @param moduleId - Module id relative to the blog directory, such as
 * `2026-07-23-post/GtvChart.svelte`.
 * @returns The loader, or undefined when no such component exists.
 * @example
 * const load = resolveIsland('2026-07-23-post/GtvChart.svelte');
 * const { default: Component } = await load();
 */
export function resolveIsland(moduleId: string): IslandLoader | undefined {
	return loaders[`./blog/${moduleId}`];
}

if (import.meta.vitest != null) {
	describe(resolveIsland, () => {
		it('returns nothing for an unknown module id', () => {
			expect(resolveIsland('nope/Nope.svelte')).toBeUndefined();
		});

		it('does not escape the blog directory', () => {
			expect(resolveIsland('../Tweet.svelte')).toBeUndefined();
		});
	});
}

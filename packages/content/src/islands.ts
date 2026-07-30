import path from 'node:path';
import { glob } from 'tinyglobby';
import type { IslandModules } from './markdown/component-islands.ts';
import { blogDirectory } from './paths.ts';

/**
 * Finds the Svelte components sitting next to a post so they can be used as
 * component tags in its markdown without being registered anywhere.
 *
 * Only the post's own directory is searched, so a component belongs to the post
 * it is colocated with and names cannot collide across posts. Posts written as
 * a single `.md` file have no directory of their own and therefore no
 * components.
 *
 * @param filepath - Absolute path of the post's markdown file.
 * @param directory - Blog source directory, used to build module ids.
 * @returns Component names mapped to module ids relative to the blog directory.
 * @example
 * await discoverPostIslands('/blog/2026-07-23-post/index.md');
 * // { GtvChart: '2026-07-23-post/GtvChart.svelte' }
 */
export async function discoverPostIslands(
	filepath: string,
	directory = blogDirectory(),
): Promise<IslandModules> {
	if (path.basename(filepath) !== 'index.md') {
		return {};
	}

	const postDirectory = path.dirname(filepath);
	const files = await glob('*.svelte', { cwd: postDirectory, absolute: true });

	return Object.fromEntries(
		files.map((file) => [
			path.basename(file, '.svelte'),
			path.relative(directory, file).replaceAll(path.sep, '/'),
		]),
	);
}

if (import.meta.vitest != null) {
	describe(discoverPostIslands, () => {
		it('finds components colocated with the post', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'post/index.md': '# Post',
				'post/GtvChart.svelte': '<p>chart</p>',
				'post/gtv-chart-data.ts': 'export const data = [];',
			});
			const islands = await discoverPostIslands(
				fixture.getPath('post/index.md'),
				fixture.getPath(),
			);

			expect(islands).toEqual({ GtvChart: 'post/GtvChart.svelte' });
		});

		it('ignores components in sibling posts', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'first/index.md': '# First',
				'second/index.md': '# Second',
				'second/Chart.svelte': '<p>chart</p>',
			});
			const islands = await discoverPostIslands(
				fixture.getPath('first/index.md'),
				fixture.getPath(),
			);

			expect(islands).toEqual({});
		});

		it('returns nothing for a single-file post', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'post.md': '# Post',
				'Chart.svelte': '<p>chart</p>',
			});
			const islands = await discoverPostIslands(fixture.getPath('post.md'), fixture.getPath());

			expect(islands).toEqual({});
		});
	});
}

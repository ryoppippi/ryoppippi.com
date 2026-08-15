import { stat } from 'node:fs/promises';
import path from 'node:path';
import type { IslandModules } from './markdown/component-islands.ts';
import { parseIslandImports } from './markdown/island-imports.ts';
import { blogDirectory } from './paths.ts';

/**
 * Resolves a post's component imports to module ids the renderer can load.
 *
 * The name a component is used under comes from the import binding, so names
 * are local to the post that declares them and cannot collide across posts.
 *
 * An import that points outside the blog directory or at a file that is not
 * there is dropped, and so is a name two imports share, because there is no
 * telling which of them the tags in the post meant. A dropped import keeps both
 * its line and its component tag in the rendered post, which shows the author
 * something is wrong.
 *
 * @param content - Markdown body, frontmatter already removed.
 * @param filepath - Absolute path of the post's markdown file.
 * @param directory - Blog source directory, used to build module ids.
 * @returns Component names mapped to module ids relative to the blog directory.
 * @example
 * await resolvePostIslands(source, '/blog/2026-07-23-post/index.md');
 * // { GtvChart: '2026-07-23-post/gtv-chart/GtvChart.svelte' }
 */
export async function resolvePostIslands(
	content: string,
	filepath: string,
	directory = blogDirectory(),
): Promise<IslandModules> {
	const postDirectory = path.dirname(filepath);
	const imports = parseIslandImports(content);
	// A name bound twice cannot be resolved to one component, and picking either
	// would silently drop the other import while its tags rendered as the one
	// that won.
	const duplicates = new Set(
		imports.map(({ name }) => name).filter((name, index, names) => names.indexOf(name) !== index),
	);
	const resolved = await Promise.all(
		imports.map(async ({ name, specifier }) => {
			if (duplicates.has(name)) {
				return null;
			}

			const absolute = path.resolve(postDirectory, specifier);
			const moduleId = path.relative(directory, absolute).replaceAll(path.sep, '/');
			// A specifier that climbs out of the blog directory would give the
			// renderer a module id it cannot load, so refuse it here.
			if (moduleId.startsWith('../') || path.isAbsolute(moduleId)) {
				return null;
			}

			try {
				// A directory can be named `Chart.svelte` and would pass an existence
				// check, so the entry has to be a file the renderer can import.
				if (!(await stat(absolute)).isFile()) {
					return null;
				}
			} catch {
				return null;
			}

			return [name, moduleId] as const;
		}),
	);

	return Object.fromEntries(resolved.filter((entry) => entry != null));
}

if (import.meta.vitest != null) {
	describe(resolvePostIslands, () => {
		it('resolves a component imported from the post directory', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'post/index.md': "import Chart from './Chart.svelte'",
				'post/Chart.svelte': '<p>chart</p>',
			});
			const islands = await resolvePostIslands(
				"import Chart from './Chart.svelte'",
				fixture.getPath('post/index.md'),
				fixture.getPath(),
			);

			expect(islands).toEqual({ Chart: 'post/Chart.svelte' });
		});

		it('resolves a component from a sibling post directory', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'en/index.md': '# Post',
				'ja/chart/GtvChart.svelte': '<p>chart</p>',
			});
			const islands = await resolvePostIslands(
				"import GtvChart from '../ja/chart/GtvChart.svelte'",
				fixture.getPath('en/index.md'),
				fixture.getPath(),
			);

			expect(islands).toEqual({ GtvChart: 'ja/chart/GtvChart.svelte' });
		});

		it('resolves a component from a subdirectory', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'post/index.md': '# Post',
				'post/chart/GtvChart.svelte': '<p>chart</p>',
			});
			const islands = await resolvePostIslands(
				"import GtvChart from './chart/GtvChart.svelte'",
				fixture.getPath('post/index.md'),
				fixture.getPath(),
			);

			expect(islands).toEqual({ GtvChart: 'post/chart/GtvChart.svelte' });
		});

		it('binds the component to the imported name', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'post/index.md': '# Post',
				'post/Chart.svelte': '<p>chart</p>',
			});
			const islands = await resolvePostIslands(
				"import Renamed from './Chart.svelte'",
				fixture.getPath('post/index.md'),
				fixture.getPath(),
			);

			expect(islands).toEqual({ Renamed: 'post/Chart.svelte' });
		});

		it('drops an import that points at a missing file', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({ 'post/index.md': '# Post' });
			const islands = await resolvePostIslands(
				"import Chart from './Chart.svelte'",
				fixture.getPath('post/index.md'),
				fixture.getPath(),
			);

			expect(islands).toEqual({});
		});

		it('refuses a specifier that climbs out of the blog directory', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'blog/post/index.md': '# Post',
				'Outside.svelte': '<p>outside</p>',
			});
			const islands = await resolvePostIslands(
				"import Outside from '../../Outside.svelte'",
				fixture.getPath('blog/post/index.md'),
				fixture.getPath('blog'),
			);

			expect(islands).toEqual({});
		});

		it('refuses a directory that happens to be named like a component', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'post/index.md': '# Post',
				'post/Chart.svelte/keep.txt': '',
			});
			const islands = await resolvePostIslands(
				"import Chart from './Chart.svelte'",
				fixture.getPath('post/index.md'),
				fixture.getPath(),
			);

			expect(islands).toEqual({});
		});

		it('drops a name that two imports bind', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'post/index.md': '# Post',
				'post/A.svelte': '<p>a</p>',
				'post/B.svelte': '<p>b</p>',
			});
			const islands = await resolvePostIslands(
				"import Chart from './A.svelte'\nimport Chart from './B.svelte'",
				fixture.getPath('post/index.md'),
				fixture.getPath(),
			);

			expect(islands).toEqual({});
		});

		it('keeps the other imports when one name is duplicated', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'post/index.md': '# Post',
				'post/A.svelte': '<p>a</p>',
				'post/B.svelte': '<p>b</p>',
				'post/Table.svelte': '<p>table</p>',
			});
			const islands = await resolvePostIslands(
				"import Chart from './A.svelte'\nimport Chart from './B.svelte'\nimport Table from './Table.svelte'",
				fixture.getPath('post/index.md'),
				fixture.getPath(),
			);

			expect(islands).toEqual({ Table: 'post/Table.svelte' });
		});

		it('returns nothing for a post that imports no components', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'post/index.md': '# Post',
				'post/Chart.svelte': '<p>chart</p>',
			});
			const islands = await resolvePostIslands(
				'# Post',
				fixture.getPath('post/index.md'),
				fixture.getPath(),
			);

			expect(islands).toEqual({});
		});
	});
}

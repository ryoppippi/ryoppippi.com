import oxContent from '@ox-content/napi';
import { discoverDocumentMdxIslands } from '@ox-content/vite-plugin';
import path from 'node:path';
import { blogDirectory } from './paths.ts';

/** Component names mapped to modules relative to the blog source directory. */
export type IslandModules = Record<string, string>;

/**
 * Resolves the document-local component imports used by a post.
 *
 * @param content - Markdown body, frontmatter already removed.
 * @param filepath - Absolute path of the post's markdown file.
 * @param directory - Blog source directory used as the import boundary.
 * @returns Used default Svelte and Solid imports keyed by their local names.
 * @example
 * await resolvePostIslands(source, '/blog/2026-07-23-post/index.md');
 * // { GtvChart: '2026-07-23-post/gtv-chart/GtvChart.tsx' }
 */
export async function resolvePostIslands(
	content: string,
	filepath: string,
	directory = blogDirectory(),
): Promise<IslandModules> {
	const parsed = oxContent.transform(content, { frontmatter: false, mdx: true });
	const discovered = await discoverDocumentMdxIslands({
		source: content,
		components: {},
		imports: parsed.imports,
		documentPath: filepath,
		contentRoot: directory,
	});
	const used = new Set(discovered.usedComponents);
	return Object.fromEntries(
		[...discovered.localBindings.values()]
			.filter(
				(binding) =>
					used.has(binding.localName) &&
					binding.kind === 'default' &&
					/\.(?:svelte|tsx)$/.test(binding.resolvedPath),
			)
			.map((binding) => [
				binding.localName,
				path.relative(directory, binding.resolvedPath).replaceAll(path.sep, '/'),
			]),
	);
}

if (import.meta.vitest != null) {
	describe(resolvePostIslands, () => {
		it('resolves a component imported from the post directory', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'post/index.md': "import Chart from './Chart.svelte'",
				'post/Chart.svelte': '<p>chart</p>',
			});

			expect(
				await resolvePostIslands(
					"import Chart from './Chart.svelte'\n\n<Chart />",
					fixture.getPath('post/index.md'),
					fixture.getPath(),
				),
			).toEqual({ Chart: 'post/Chart.svelte' });
		});

		it('resolves a component from a sibling post directory', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'en/index.md': '# Post',
				'ja/chart/GtvChart.tsx': 'export default () => null',
			});

			expect(
				await resolvePostIslands(
					"import GtvChart from '../ja/chart/GtvChart.tsx'\n\n<GtvChart />",
					fixture.getPath('en/index.md'),
					fixture.getPath(),
				),
			).toEqual({ GtvChart: 'ja/chart/GtvChart.tsx' });
		});

		it('binds the component to the imported name', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'post/index.md': '# Post',
				'post/Chart.svelte': '<p>chart</p>',
			});

			expect(
				await resolvePostIslands(
					"import Renamed from './Chart.svelte'\n\n<Renamed />",
					fixture.getPath('post/index.md'),
					fixture.getPath(),
				),
			).toEqual({ Renamed: 'post/Chart.svelte' });
		});

		it('refuses a specifier that climbs out of the blog directory', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'blog/post/index.md': '# Post',
				'Outside.svelte': '<p>outside</p>',
			});

			expect(
				await resolvePostIslands(
					"import Outside from '../../Outside.svelte'\n\n<Outside />",
					fixture.getPath('blog/post/index.md'),
					fixture.getPath('blog'),
				),
			).toEqual({});
		});

		it('drops a name that two imports bind', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'post/index.md': '# Post',
				'post/A.svelte': '<p>a</p>',
				'post/B.svelte': '<p>b</p>',
			});

			expect(
				await resolvePostIslands(
					"import Chart from './A.svelte'\nimport Chart from './B.svelte'\n\n<Chart />",
					fixture.getPath('post/index.md'),
					fixture.getPath(),
				),
			).toEqual({});
		});

		it('returns nothing when an imported component is unused', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'post/index.md': '# Post',
				'post/Chart.svelte': '<p>chart</p>',
			});

			expect(
				await resolvePostIslands(
					"import Chart from './Chart.svelte'\n\n# Post",
					fixture.getPath('post/index.md'),
					fixture.getPath(),
				),
			).toEqual({});
		});
	});
}

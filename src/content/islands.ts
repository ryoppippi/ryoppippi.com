import oxContent from '@ox-content/napi';
import { discoverDocumentMdxIslands } from '@ox-content/vite-plugin';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { matter } from 'gray-matter-es';
import { glob } from 'tinyglobby';
import { blogDirectory } from './paths.ts';

/** Component names mapped to modules relative to the blog source directory. */
export type IslandModules = Record<string, string>;

/**
 * Selects documents whose islands may enter the production client graph.
 * @param directory - Blog source directory.
 * @returns Explicitly published documents for the framework registry.
 */
export async function loadPublishedIslandDocuments(directory: string) {
	const files = await glob(['*.md', '*.mdx', '*/index.md', '*/index.mdx'], {
		cwd: directory,
		absolute: true,
	});
	const documents = await Promise.all(
		files.map(async (documentPath) => ({
			documentPath,
			source: await readFile(documentPath, 'utf8'),
		})),
	);
	return documents.filter(({ source }) => matter(source).data.isPublished === true);
}

/**
 * Resolves the document-local component imports used by a post.
 *
 * @param content - Markdown body, frontmatter already removed.
 * @param filepath - Absolute path of the post's markdown file.
 * @param directory - Blog source directory used as the import boundary.
 * @returns Used default Solid imports keyed by their local names.
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
					binding.resolvedPath.endsWith('.tsx'),
			)
			.map((binding) => [
				binding.localName,
				path.relative(directory, binding.resolvedPath).replaceAll(path.sep, '/'),
			]),
	);
}

if (import.meta.vitest != null) {
	it('selects only explicitly published documents for the client registry', async () => {
		const { createFixture } = await import('fs-fixture');
		await using fixture = await createFixture({
			'public/index.mdx': '---\nisPublished: true\n---\nPublic',
			'draft/index.mdx': '---\nisPublished: false\n---\nDraft',
			'unspecified/index.mdx': '---\ntitle: Unspecified\n---\nUnspecified',
		});
		expect(
			(await loadPublishedIslandDocuments(fixture.path)).map(({ documentPath }) =>
				path.relative(fixture.path, documentPath),
			),
		).toEqual(['public/index.mdx']);
	});
}

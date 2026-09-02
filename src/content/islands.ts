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

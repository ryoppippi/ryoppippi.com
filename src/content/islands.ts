import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { matter } from 'gray-matter-es';
import { glob } from 'tinyglobby';

/**
 * Selects documents whose islands may enter the client graph.
 * @param directory - Blog source directory.
 * @param options - Whether the development preview includes unpublished documents.
 * @returns Documents permitted by the site's publication policy.
 */
export async function loadIslandDocuments(
	directory: string,
	options: { includeDrafts?: boolean } = {},
) {
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
	return documents.filter(
		({ source }) => options.includeDrafts === true || matter(source).data.isPublished === true,
	);
}

if (import.meta.vitest != null) {
	it.each([
		{ includeDrafts: false, expected: ['public/index.mdx'] },
		{
			includeDrafts: true,
			expected: ['draft/index.mdx', 'public/index.mdx', 'unspecified/index.mdx'],
		},
	])(
		'selects client documents with includeDrafts=$includeDrafts',
		async ({ includeDrafts, expected }) => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'public/index.mdx': '---\nisPublished: true\n---\nPublic',
				'draft/index.mdx': '---\nisPublished: false\n---\nDraft',
				'unspecified/index.mdx': '---\ntitle: Unspecified\n---\nUnspecified',
			});
			expect(
				(await loadIslandDocuments(fixture.path, { includeDrafts }))
					.map(({ documentPath }) => path.relative(fixture.path, documentPath))
					.sort(),
			).toEqual(expected);
		},
	);
}

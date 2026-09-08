import path from 'node:path';
import {
	resolveSolidHtmlHostCollectionDocuments,
	type SolidHtmlHostCollectionDocumentsOptions,
} from '@ox-content/vite-plugin-solid';
import { BLOG_SOURCE_PATTERNS } from '../../config/content.ts';

/** Production islands require explicit publication; development previews include drafts. */
export const BLOG_ISLAND_DOCUMENTS = {
	collections: ['blog'],
	select: ({ frontmatter }, { command }) => command === 'serve' || frontmatter.isPublished === true,
} satisfies SolidHtmlHostCollectionDocumentsOptions;

if (import.meta.vitest != null) {
	test.each([
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
				(
					await resolveSolidHtmlHostCollectionDocuments(
						{
							...BLOG_ISLAND_DOCUMENTS,
							oxContent: {
								srcDir: fixture.path,
								collections: { blog: { source: BLOG_SOURCE_PATTERNS } },
							},
						},
						{ root: fixture.path, mode: 'test', command: includeDrafts ? 'serve' : 'build' },
					)
				)
					.map(({ documentPath }) => path.relative(fixture.path, documentPath))
					.sort(),
			).toEqual(expected);
		},
	);
}

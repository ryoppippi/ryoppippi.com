import type { OxContentOptions } from '@ox-content/vite-plugin';
import { resolveSvelteHtmlHostCollectionDocuments } from '@ox-content/vite-plugin-svelte';
import type { Plugin } from 'vite-plus';
import { blogPermalink, blogSlug } from '../../config/content.ts';
import { OX_CONTENT_BUILD_OPTIONS } from '../../config/ox-content.ts';

/** A blog source whose declared route disagrees with where the file lives. */
export type BlogPermalinkViolation = {
	/** Source path as Ox Content resolved it. */
	documentPath: string;
	/** Route the source must declare. */
	expected: string;
	/** Route the source declares, or `undefined` when the key is absent. */
	actual: string | undefined;
};

/**
 * Finds blog sources whose `permalink` does not match their slug.
 *
 * Routing is driven entirely by the front matter key, so a missing or stale
 * `permalink` silently publishes a post under the wrong URL — or not at all.
 *
 * @param root - Vite project root.
 * @param oxContent - Configured collections, or isolated fixture collections in tests.
 * @returns Every mismatch, ordered by document path.
 * @example
 * const violations = await findBlogPermalinkViolations(process.cwd());
 */
export async function findBlogPermalinkViolations(
	root: string,
	oxContent: OxContentOptions = OX_CONTENT_BUILD_OPTIONS,
): Promise<BlogPermalinkViolation[]> {
	const documents = await resolveSvelteHtmlHostCollectionDocuments(
		// Drafts are routed too, so publish state must not narrow the check.
		{ oxContent, collections: ['blog'], select: () => true },
		{ root, command: 'build', mode: 'production' },
	);
	return documents
		.map(({ documentPath, frontmatter }) => {
			const expected = blogPermalink(blogSlug(documentPath));
			const actual = typeof frontmatter.permalink === 'string' ? frontmatter.permalink : undefined;
			return actual === expected ? undefined : { documentPath, expected, actual };
		})
		.filter((violation) => violation != null)
		.sort((a, b) => a.documentPath.localeCompare(b.documentPath));
}

/**
 * Renders violations as an error message that names the fix for each source.
 *
 * @param violations - Mismatches from {@link findBlogPermalinkViolations}.
 * @returns A multi-line report.
 */
export function formatBlogPermalinkViolations(
	violations: readonly BlogPermalinkViolation[],
): string {
	const lines = violations.map(
		({ documentPath, expected, actual }) =>
			`  ${documentPath}\n    expected permalink: ${expected}\n    found: ${actual ?? '(missing)'}`,
	);
	return `Blog sources must declare their public route as \`permalink\`:\n${lines.join('\n')}`;
}

/**
 * Fails the build when a blog source declares the wrong route.
 *
 * @returns The validation plugin.
 */
export function validateBlogPermalinks(): Plugin {
	let root = process.cwd();
	return {
		name: 'ryoppippi:validate-blog-permalinks',
		configResolved(config) {
			root = config.root;
		},
		async buildStart() {
			const violations = await findBlogPermalinkViolations(root);
			if (violations.length > 0) this.error(formatBlogPermalinkViolations(violations));
		},
	};
}

if (import.meta.vitest != null) {
	const { createFixture } = await import('fs-fixture');
	const oxContent = {
		srcDir: 'content',
		collections: { blog: { source: ['blog/*/index.md', 'blog/*.md'] } },
	} as const satisfies OxContentOptions;

	test('accepts sources whose permalink matches their slug', async () => {
		await using fixture = await createFixture({
			'content/blog/2026-01-01-nested-ja/index.md':
				'---\npermalink: /blog/2026-01-01-nested-ja\ntitle: Nested\n---\nBody',
			'content/blog/2026-01-02-flat-ja.md':
				'---\npermalink: /blog/2026-01-02-flat-ja\ntitle: Flat\n---\nBody',
		});
		await expect(findBlogPermalinkViolations(fixture.path, oxContent)).resolves.toEqual([]);
	});

	test('reports a missing permalink', async () => {
		await using fixture = await createFixture({
			'content/blog/2026-01-01-nested-ja/index.md': '---\ntitle: Nested\n---\nBody',
		});
		await expect(findBlogPermalinkViolations(fixture.path, oxContent)).resolves.toMatchObject([
			{ expected: '/blog/2026-01-01-nested-ja', actual: undefined },
		]);
	});

	test('reports a permalink pointing at another slug', async () => {
		await using fixture = await createFixture({
			'content/blog/2026-01-01-nested-ja/index.md':
				'---\npermalink: /blog/typo\ntitle: Nested\n---\nBody',
		});
		await expect(findBlogPermalinkViolations(fixture.path, oxContent)).resolves.toMatchObject([
			{ expected: '/blog/2026-01-01-nested-ja', actual: '/blog/typo' },
		]);
	});

	test('checks drafts as well as published posts', async () => {
		await using fixture = await createFixture({
			'content/blog/2026-01-01-draft-ja/index.md':
				'---\nisPublished: false\ntitle: Draft\n---\nBody',
		});
		await expect(findBlogPermalinkViolations(fixture.path, oxContent)).resolves.toHaveLength(1);
	});

	test('names the offending source and the expected route', () => {
		expect(
			formatBlogPermalinkViolations([
				{ documentPath: 'blog/post/index.md', expected: '/blog/post', actual: undefined },
			]),
		).toBe(
			'Blog sources must declare their public route as `permalink`:\n' +
				'  blog/post/index.md\n    expected permalink: /blog/post\n    found: (missing)',
		);
	});
}

import type {
	CollectionValidationContext,
	CollectionValidationResult,
} from '@ox-content/vite-plugin';
import path from 'node:path';

/** Shared root of the configured blog and showcase collections. */
export const CONTENT_DIRECTORY = path.resolve(import.meta.dirname, '../content');

/** Markdown and MDX files that form the blog collection. */
export const BLOG_SOURCE_PATTERNS = ['*.md', '*.mdx', '*/index.md', '*/index.mdx'] as const;

/** Showcase documents relative to the shared content root. */
export const SHOWCASE_SOURCE_PATTERN = 'works/showcase/*/index.md';

/** Canonical authored blog directory, shared with the new-post command. */
export const BLOG_DIRECTORY = path.join(CONTENT_DIRECTORY, 'blog');

/** Canonical authored showcase directory. */
export const SHOWCASE_DIRECTORY = path.join(CONTENT_DIRECTORY, 'works/showcase');

/**
 * Public route of a blog post, used as the `permalink` front matter value.
 *
 * The blog collection is mounted below `/blog`, so every source must declare
 * the route explicitly; keeping the shape here stops the new-post command and
 * the collection validator from drifting apart.
 *
 * @param slug - Directory name of the post, e.g. `2026-09-09-revenge-ja`.
 * @returns The permalink, e.g. `/blog/2026-09-09-revenge-ja`.
 * @example
 * blogPermalink('2026-09-09-revenge-ja'); // '/blog/2026-09-09-revenge-ja'
 */
export function blogPermalink(slug: string): string {
	return `/blog/${slug}`;
}

/**
 * Rejects a blog document whose `permalink` disagrees with its source layout.
 *
 * Ox Content routes a post entirely from this key, so a missing or stale value
 * publishes it under the wrong URL. `path` is the route the file tree already
 * implies, before permalink rewrites, so it is what the key has to repeat.
 *
 * @param context - Collection validation context supplied by Ox Content.
 * @returns A diagnostic message, or nothing when the document is valid.
 * @example
 * validateBlogPermalink({ path: '/blog/post', frontmatter: {} });
 * // 'expected permalink /blog/post, found (missing)'
 */
export function validateBlogPermalink({
	path: route,
	frontmatter,
}: Pick<CollectionValidationContext, 'path' | 'frontmatter'>): CollectionValidationResult {
	if (frontmatter.permalink === route) return;
	// An absent key and a malformed value need different fixes, so say which it is.
	const found = 'permalink' in frontmatter ? JSON.stringify(frontmatter.permalink) : '(missing)';
	return `expected permalink ${route}, found ${found}`;
}

if (import.meta.vitest != null) {
	test.each([
		{ name: 'a matching permalink', frontmatter: { permalink: '/blog/post' }, expected: undefined },
		{
			name: 'an absent key',
			frontmatter: { title: 'Post' },
			expected: 'expected permalink /blog/post, found (missing)',
		},
		{
			name: 'a stale route',
			frontmatter: { permalink: '/blog/typo' },
			expected: 'expected permalink /blog/post, found "/blog/typo"',
		},
		{
			name: 'a non-string value',
			frontmatter: { permalink: 42 },
			expected: 'expected permalink /blog/post, found 42',
		},
		{
			name: 'an explicitly null value',
			frontmatter: { permalink: null },
			expected: 'expected permalink /blog/post, found null',
		},
	] as const)('reports $name', ({ frontmatter, expected }) => {
		expect(validateBlogPermalink({ path: '/blog/post', frontmatter })).toBe(expected);
	});
}

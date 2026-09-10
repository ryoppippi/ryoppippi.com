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
 * the collection test from drifting apart.
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
 * Slug of a blog source, derived from where the file sits in the collection.
 *
 * A post either owns a directory as `<slug>/index.md` or is a flat `<slug>.md`,
 * so both layouts have to collapse to the same name.
 *
 * @param documentPath - Path to the source, absolute or relative to the collection.
 * @returns The slug, e.g. `2026-09-09-revenge-ja`.
 * @example
 * blogSlug('2026-09-09-revenge-ja/index.mdx'); // '2026-09-09-revenge-ja'
 * blogSlug('2026-09-09-revenge-ja.md'); // '2026-09-09-revenge-ja'
 */
export function blogSlug(documentPath: string): string {
	const base = path.basename(documentPath);
	return /^index\.mdx?$/.test(base)
		? path.basename(path.dirname(documentPath))
		: path.basename(base, path.extname(base));
}

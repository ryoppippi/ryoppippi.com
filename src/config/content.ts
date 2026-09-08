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

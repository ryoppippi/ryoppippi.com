import path from 'node:path';

const contentRoot = path.resolve(import.meta.dirname, '../content');

/** Markdown and MDX files that form the blog collection. */
export const BLOG_SOURCE_PATTERNS = ['*.md', '*.mdx', '*/index.md', '*/index.mdx'] as const;

/** Showcase files relative to the configured blog collection root. */
export const SHOWCASE_SOURCE_PATTERN = '../works/showcase/*.md';

/** Canonical authored blog directory, shared with the new-post command. */
export const BLOG_DIRECTORY = path.join(contentRoot, 'blog');

/** Canonical authored showcase directory. */
export const SHOWCASE_DIRECTORY = path.join(contentRoot, 'works/showcase');

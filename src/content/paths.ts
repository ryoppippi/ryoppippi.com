import path from 'node:path';

const contentRoot = path.resolve(import.meta.dirname);

/** Markdown and MDX files that form the blog collection. */
export const BLOG_SOURCE_PATTERNS = ['*.md', '*.mdx', '*/index.md', '*/index.mdx'] as const;

/** Showcase files relative to the configured blog collection root. */
export const SHOWCASE_SOURCE_PATTERN = '../works/showcase/*.md';

export function blogDirectory(root = contentRoot) {
	return path.join(root, 'blog');
}

export function showcaseDirectory(root = contentRoot) {
	return path.join(root, 'works/showcase');
}

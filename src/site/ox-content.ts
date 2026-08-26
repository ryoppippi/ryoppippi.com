import type { OxContentOptions } from '@ox-content/vite-plugin';
import { Route } from '../../routes.ts';

export const BLOG_COLLECTION_PATTERNS = ['*.md', '*.mdx', '*/index.md', '*/index.mdx'] as const;

const redirects = [...Route, { from: '/works', to: '/works/oss', status: 301 }] as const;
const redirectMap = Object.fromEntries(redirects.map(({ from, to }) => [from, to]));

export const OX_CONTENT_BUILD_OPTIONS = {
	attrs: true,
	srcDir: 'packages/content/src/blog',
	outDir: 'build',
	collections: { blog: BLOG_COLLECTION_PATTERNS },
	docs: false,
	feeds: {
		collection: 'blog',
		formats: ['rss'],
		limit: 1_000,
		path: '/',
	},
	permalinks: true,
	notByAi: true,
	redirects: {
		allowExternal: true,
		map: redirectMap,
		provider: 'cloudflare',
	},
	ssg: {
		bare: true,
		markdownSource: { alternate: true },
		siteName: 'blog | ryoppippi.com',
		siteUrl: 'https://ryoppippi.com',
	},
	search: false,
} as const satisfies OxContentOptions;

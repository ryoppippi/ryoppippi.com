import { oxContent, type OxContentOptions } from '@ox-content/vite-plugin';
import type { Plugin } from 'vite';
import { Route } from '../../routes.ts';

export const BLOG_COLLECTION_PATTERNS = ['*.md', '*.mdx', '*/index.md', '*/index.mdx'] as const;

const redirects = [...Route, { from: '/works', to: '/works/oss', status: 301 }] as const;
const redirectMap = Object.fromEntries(redirects.map(({ from, to }) => [from, to]));

export const OX_CONTENT_BUILD_OPTIONS = {
	srcDir: 'packages/content/src/blog',
	outDir: 'build',
	collections: { blog: BLOG_COLLECTION_PATTERNS },
	feeds: {
		collection: 'blog',
		formats: ['rss'],
		limit: 1_000,
		path: '/',
	},
	permalinks: true,
	redirects: {
		allowExternal: true,
		map: redirectMap,
		netlify: true,
	},
	ssg: {
		markdownSource: { alternate: true },
		siteName: 'blog | ryoppippi.com',
		siteUrl: 'https://ryoppippi.com',
	},
} as const satisfies OxContentOptions;

/**
 * Returns the core build plugin omitted by the Svelte adapter.
 *
 * @returns The Ox Content SSG plugin that writes HTML and auxiliary output files.
 */
export function oxContentBuildPlugins(): Plugin[] {
	const plugins = oxContent(OX_CONTENT_BUILD_OPTIONS).filter(
		(plugin) => plugin.name === 'ox-content:ssg',
	);
	if (plugins.length !== 1) {
		throw new Error('Expected exactly one Ox Content SSG plugin');
	}
	return plugins;
}

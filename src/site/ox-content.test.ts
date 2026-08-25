import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'tinyglobby';
import {
	BLOG_COLLECTION_PATTERNS,
	OX_CONTENT_BUILD_OPTIONS,
	oxContentBuildPlugins,
} from './ox-content.ts';

describe('Ox Content build outputs', () => {
	it('configures the blog RSS feed and Cloudflare redirects', () => {
		expect(OX_CONTENT_BUILD_OPTIONS).toMatchObject({
			collections: { blog: BLOG_COLLECTION_PATTERNS },
			feeds: {
				collection: 'blog',
				formats: ['rss'],
				path: '/',
			},
			redirects: {
				allowExternal: true,
				map: expect.objectContaining({
					'/cv': 'https://cv.ryoppippi.com',
					'/reddit': 'https://www.reddit.com/user/ryoppippi',
					'/talks*': '/works/talks',
					'/projects*': '/works',
					'/works': '/works/oss',
				}),
				netlify: true,
			},
			ssg: {
				siteName: 'blog | ryoppippi.com',
				siteUrl: 'https://ryoppippi.com',
			},
		});
	});

	it('isolates the temporary Svelte adapter workaround to the core SSG plugin', () => {
		expect(oxContentBuildPlugins().map((plugin) => plugin.name)).toEqual(['ox-content:ssg']);
	});

	it('mounts every blog source below the public blog route', async () => {
		const root = path.join(process.cwd(), 'packages/content/src/blog');
		const files = await glob(BLOG_COLLECTION_PATTERNS, { cwd: root });

		for (const file of files) {
			const slug = path.dirname(file);
			expect(await readFile(path.join(root, file), 'utf8')).toMatch(
				new RegExp(`^---\\npermalink: /blog/${slug}\\n`),
			);
		}
	});
});

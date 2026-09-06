import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'tinyglobby';
import { OX_CONTENT_BUILD_OPTIONS } from './ox-content.ts';
import { BLOG_SOURCE_PATTERNS, SHOWCASE_SOURCE_PATTERN } from '../content/paths.ts';

describe('Ox Content build outputs', () => {
	it('configures the blog RSS feed and Cloudflare redirects', () => {
		expect(OX_CONTENT_BUILD_OPTIONS).toMatchObject({
			collections: {
				blog: { source: BLOG_SOURCE_PATTERNS, include: ['body'] },
				showcase: { source: SHOWCASE_SOURCE_PATTERN, include: ['body'] },
			},
			feeds: {
				blog: {
					collection: 'blog',
					formats: ['rss'],
					path: '/',
				},
				media: {
					collection: 'media',
					formats: ['rss'],
					path: '/works/media',
				},
			},
			redirects: {
				allowExternal: true,
				html: false,
				map: expect.objectContaining({
					'/cv': 'https://cv.ryoppippi.com',
					'/reddit': 'https://www.reddit.com/user/ryoppippi',
					'/talks*': '/works/talks',
					'/projects*': '/works',
					'/works': '/works/oss',
				}),
				provider: 'cloudflare',
			},
			ssg: {
				bare: true,
				minifyHtml: true,
				siteName: 'blog | ryoppippi.com',
				siteUrl: 'https://ryoppippi.com',
			},
		});
	});

	it('mounts every blog source below the public blog route', async () => {
		const root = path.join(process.cwd(), 'src/content/blog');
		const files = await glob(BLOG_SOURCE_PATTERNS, { cwd: root });

		for (const file of files) {
			const slug = path.dirname(file);
			expect(await readFile(path.join(root, file), 'utf8')).toMatch(
				new RegExp(`^---\\npermalink: /blog/${slug}\\n`),
			);
		}
	});
});

import type { PostListItem } from './content.ts';
import type { GeneratedFile } from './pages.ts';
import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { writeOxContentOutputFiles } from './ox-content-output.ts';

const temporaryDirectories: string[] = [];

afterEach(async () => {
	await Promise.all(
		temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
	);
});

describe(writeOxContentOutputFiles, () => {
	it('writes the complete sitemap and curated media feed with Ox Content', async () => {
		const outDir = await mkdtemp(path.join(os.tmpdir(), 'ryoppippi-site-output-'));
		temporaryDirectories.push(outDir);
		const root = '/site';
		const pages = [
			{
				path: 'index.html',
				content: '<h1>Home</h1>',
				sourcePaths: ['src/home.ts', 'src/home-data.json'],
			},
			{
				path: 'blog/post/index.html',
				content: '<h1>Post</h1>',
				sourcePaths: ['content/post.md'],
			},
			{ path: '404.html', content: '<h1>Not found</h1>', sourcePaths: ['src/404.ts'] },
		] satisfies GeneratedFile[];
		const media = [
			{
				title: 'Interview',
				slug: 'interview',
				link: 'https://example.com/interview',
				pubDate: '2026-08-20T12:34:56.000Z',
				lang: 'ja',
				external: true,
				kind: 'podcast',
			},
			{
				title: 'Playlist',
				slug: 'playlist',
				link: 'https://example.com/playlist',
				pubDate: '2026-08-19T12:34:56.000Z',
				lang: 'ja',
				external: true,
				kind: 'video',
				playlist: true,
			},
		] satisfies PostListItem[];
		const timestamps = new Map([
			[path.join(root, 'src/home.ts'), Date.parse('2026-08-01T00:00:00.000Z')],
			[path.join(root, 'src/home-data.json'), Date.parse('2026-08-03T00:00:00.000Z')],
			[path.join(root, 'content/post.md'), Date.parse('2026-08-02T00:00:00.000Z')],
		]);

		await writeOxContentOutputFiles({
			media,
			outDir,
			pages,
			root,
			resolveLastmod: (file) => timestamps.get(file),
		});

		const sitemap = await readFile(path.join(outDir, 'sitemap.xml'), 'utf8');
		expect(sitemap).toContain('<loc>https://ryoppippi.com/</loc>');
		expect(sitemap).toContain('<lastmod>2026-08-03</lastmod>');
		expect(sitemap).toContain('<loc>https://ryoppippi.com/blog/post/</loc>');
		expect(sitemap).not.toContain('/404/');

		const feed = await readFile(path.join(outDir, 'works/media/feed.xml'), 'utf8');
		expect(feed).toContain('<title>Interview</title>');
		expect(feed).toContain('<description>Podcast | Interview</description>');
		expect(feed).not.toContain('Playlist');
	});
});

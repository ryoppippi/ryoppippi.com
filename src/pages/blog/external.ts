import type { BlogPostMetadata } from './data.ts';
import { readFile } from 'node:fs/promises';
import process from 'node:process';
import path from 'node:path';
import { loadBlogFeedEntries } from '@ox-content/vite-plugin';
import { toExternalPost, type ExternalPostInput, type PostListItem } from '@/lib/post-list.ts';

/**
 * Loads external blog entries from RSS feeds and curated articles.
 *
 * @param root - Repository root containing the external content configuration.
 * @returns Blog-list entries for external content.
 */
export async function loadExternalPosts(root = process.cwd()): Promise<PostListItem[]> {
	const [rssSource, postsSource] = await Promise.all([
		readFile(path.join(root, 'src/content/blog/external/rss.json'), 'utf8'),
		readFile(path.join(root, 'src/content/blog/external/posts.json'), 'utf8'),
	]);
	const sources = JSON.parse(rssSource) as string[];
	const configuredPosts = JSON.parse(postsSource) as ExternalPostInput[];
	const feeds = await loadBlogFeedEntries({
		sources: sources.map((url) => ({ url, onError: 'warn', language: 'ja' })),
	});
	if (feeds.fatals.length > 0) {
		throw new Error(feeds.fatals.join('\n'));
	}
	for (const warning of feeds.warnings) {
		console.warn(warning);
	}
	const feedPosts = feeds.entries.flatMap((item) => {
		const post = toExternalPost({
			title: item.title,
			link: item.url,
			guid: item.id,
			pubDate: item.date,
			lang: item.language,
		});
		return post == null ? [] : [post];
	});
	const manualPosts = configuredPosts.flatMap((item) => {
		const post = toExternalPost(item);
		return post == null ? [] : [post];
	});
	return [...feedPosts, ...manualPosts];
}

/**
 * Converts blog post metadata into blog list entries.
 *
 * @param posts - Blog post metadata to list
 * @param options - Set `includeDrafts` to keep unpublished posts (used by the
 * dev server so drafts appear with a draft mark)
 * @returns List items for the blog index page
 */
export function postListItems(
	posts: BlogPostMetadata[],
	options: { includeDrafts?: boolean } = {},
): PostListItem[] {
	return posts
		.filter((post) => (options.includeDrafts ?? false) || post.isPublished)
		.map((post) => ({
			title: post.title,
			slug: post.filename,
			link: `/blog/${post.filename}/`,
			pubDate: post.pubDate,
			lang: post.lang,
			external: false,
			draft: !post.isPublished,
		}));
}

if (import.meta.vitest != null) {
	test('loads curated entries with no remote sources and excludes invalid dates', async () => {
		const { createFixture } = await import('fs-fixture');
		await using fixture = await createFixture({
			'src/content/blog/external/rss.json': '[]',
			'src/content/blog/external/posts.json': JSON.stringify([
				{ title: 'Article', link: 'https://example.com/article', pubDate: '2026-01-01' },
				{ title: 'Invalid', link: 'https://example.com/invalid', pubDate: 'invalid' },
			]),
		});
		expect(await loadExternalPosts(fixture.getPath())).toEqual([
			{
				title: 'Article',
				slug: 'https://example.com/article',
				link: 'https://example.com/article',
				pubDate: '2026-01-01T00:00:00.000Z',
				lang: 'ja',
				external: true,
				kind: 'article',
			},
		]);
	});
}

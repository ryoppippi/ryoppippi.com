import type { BlogPostMetadata } from '@/content/index.ts';
import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { loadBlogFeedEntries } from '@ox-content/vite-plugin';
import path from 'node:path';

export type PostListItem = {
	title: string;
	slug: string;
	link: string;
	pubDate: string;
	lang: string;
	external: boolean;
	kind?: 'article' | 'podcast' | 'video';
	playlist?: boolean;
	draft?: boolean;
};

type ExternalPostInput = {
	title?: string | null;
	link?: string | null;
	pubDate?: string | null;
	guid?: string | null;
	lang?: string | null;
	kind?: 'article' | 'podcast' | 'video' | null;
	playlist?: boolean | null;
};

function toExternalPost(
	item: ExternalPostInput,
	defaultKind: NonNullable<PostListItem['kind']> = 'article',
): PostListItem | null {
	if (item.title == null || item.link == null || item.pubDate == null) {
		return null;
	}

	const pubDate = new Date(item.pubDate);
	if (Number.isNaN(pubDate.getTime())) {
		return null;
	}

	return {
		title: item.title,
		slug: item.guid ?? item.link,
		link: item.link,
		pubDate: pubDate.toJSON(),
		lang: item.lang ?? 'ja',
		external: true,
		kind: item.kind ?? defaultKind,
		...(item.playlist === true ? { playlist: true } : {}),
	};
}

/**
 * Loads external blog entries from RSS feeds and curated articles.
 *
 * @param root - Repository root containing the external content configuration.
 * @returns Blog-list entries for external content.
 */
export async function loadExternalPosts(root = process.cwd()): Promise<PostListItem[]> {
	const [rssSource, postsSource] = await Promise.all([
		readFile(path.join(root, 'src/contents/external-rss/rss.json'), 'utf8'),
		readFile(path.join(root, 'src/contents/external-rss/posts.json'), 'utf8'),
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
 * Loads curated podcasts and videos for the media page.
 *
 * @param root - Repository root containing the media configuration.
 * @returns Media entries for the media page.
 */
export async function loadExternalMedia(root = process.cwd()): Promise<PostListItem[]> {
	const source = await readFile(path.join(root, 'src/contents/external-rss/media.json'), 'utf8');
	const configuredMedia = JSON.parse(source) as ExternalPostInput[];
	const mediaPosts = configuredMedia.flatMap((item) => {
		const post = toExternalPost(item, 'podcast');
		return post == null ? [] : [post];
	});
	return mediaPosts;
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
	it('loads curated entries with no remote sources and excludes invalid dates', async () => {
		const { createFixture } = await import('fs-fixture');
		await using fixture = await createFixture({
			'src/contents/external-rss/rss.json': '[]',
			'src/contents/external-rss/posts.json': JSON.stringify([
				{ title: 'Article', link: 'https://example.com/article', pubDate: '2026-01-01' },
				{ title: 'Invalid', link: 'https://example.com/invalid', pubDate: 'invalid' },
			]),
		});
		expect(await loadExternalPosts(fixture.getPath())).toEqual([
			{ title: 'Article', slug: 'https://example.com/article', link: 'https://example.com/article', pubDate: '2026-01-01T00:00:00.000Z', lang: 'ja', external: true, kind: 'article' },
		]);
	});
}

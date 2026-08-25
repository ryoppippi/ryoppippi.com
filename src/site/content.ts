import type { BlogPostMetadata } from '@ryoppippi/content';
import { readFile } from 'node:fs/promises';
import process from 'node:process';
import Parser from 'rss-parser';
import path from 'node:path';

export type PostListItem = {
	title: string;
	slug: string;
	link: string;
	pubDate: string;
	lang: string;
	external: boolean;
	kind?: 'article' | 'podcast' | 'video';
	draft?: boolean;
};

type ExternalPostInput = {
	title?: string | null;
	link?: string | null;
	pubDate?: string | null;
	guid?: string | null;
	lang?: string | null;
	kind?: 'article' | 'podcast' | 'video' | null;
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
	};
}

/**
 * Loads external blog entries from RSS feeds, curated posts, and media.
 *
 * @param root - Repository root containing the external content configuration.
 * @returns Blog-list entries for external content.
 */
export async function loadExternalPosts(root = process.cwd()): Promise<PostListItem[]> {
	const [rssSource, postsSource, mediaSource] = await Promise.all([
		readFile(path.join(root, 'src/contents/external-rss/rss.json'), 'utf8'),
		readFile(path.join(root, 'src/contents/external-rss/posts.json'), 'utf8'),
		readFile(path.join(root, 'src/contents/external-rss/media.json'), 'utf8'),
	]);
	const sources = JSON.parse(rssSource) as string[];
	const configuredPosts = JSON.parse(postsSource) as ExternalPostInput[];
	const configuredMedia = JSON.parse(mediaSource) as ExternalPostInput[];
	const parser = new Parser();
	const feeds = await Promise.allSettled(sources.map(async (source) => parser.parseURL(source)));
	const feedPosts = feeds.flatMap((result) => {
		if (result.status === 'rejected') {
			console.warn(`Skipping external RSS feed: ${String(result.reason)}`);
			return [];
		}
		return result.value.items.flatMap((item) => {
			const post = toExternalPost(item);
			return post == null ? [] : [post];
		});
	});
	const manualPosts = configuredPosts.flatMap((item) => {
		const post = toExternalPost(item);
		return post == null ? [] : [post];
	});
	const mediaPosts = configuredMedia.flatMap((item) => {
		const post = toExternalPost(item, 'podcast');
		return post == null ? [] : [post];
	});
	return [...feedPosts, ...manualPosts, ...mediaPosts];
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

import type { BlogPostMetadata } from '../content/index.ts';
import type { FeedChannelOptions, FeedItemInput, RenderedFeedFile } from '@ox-content/vite-plugin';
import type { PostListItem } from '../contents/external-content.ts';
import { renderFeedFiles, resolveFeedsOptions, writeFeedFiles } from '@ox-content/vite-plugin';
import { SITE_COPYRIGHT, SITE_NAME, SITE_ORIGIN, SITE_SOCIAL_IMAGE_URL } from '../config/site.ts';

const BLOG_FEED_CHANNEL = {
	formats: ['rss'],
	limit: 1_000,
	path: '/',
	title: `blog | ${SITE_NAME}`,
	description: `blog | ${SITE_NAME}`,
	language: 'en',
	image: SITE_SOCIAL_IMAGE_URL,
	favicon: SITE_SOCIAL_IMAGE_URL,
	copyright: SITE_COPYRIGHT,
} as const satisfies FeedChannelOptions;

const MEDIA_FEED_CHANNEL = {
	formats: ['rss'],
	limit: 1_000,
	path: '/works/media',
	title: `Media | ${SITE_NAME}`,
	description: `Media appearances by ${SITE_NAME}`,
	language: 'ja',
	image: SITE_SOCIAL_IMAGE_URL,
	favicon: SITE_SOCIAL_IMAGE_URL,
	copyright: SITE_COPYRIGHT,
} as const satisfies FeedChannelOptions;

export const BLOG_FEED_OPTIONS = {
	...BLOG_FEED_CHANNEL,
	collection: 'blog',
} as const satisfies FeedChannelOptions;

function feedInput(channel: FeedChannelOptions, items: readonly FeedItemInput[]) {
	return {
		base: channel.path ?? '/',
		items,
		options: resolveFeedsOptions(channel),
		siteName: SITE_NAME,
		siteUrl: SITE_ORIGIN,
	};
}

function blogFeedItems(posts: readonly BlogPostMetadata[]): FeedItemInput[] {
	return posts.map((post) => ({
		title: post.title,
		path: `blog/${post.filename}`,
		date: post.pubDate,
		description: `${post.title} | ${post.readingTime < 1 ? 'Under a minute' : `${post.readingTime} min read`}`,
		draft: !post.isPublished,
	}));
}

function mediaFeedItems(items: readonly PostListItem[]): FeedItemInput[] {
	return items
		.filter((item) => item.playlist !== true)
		.map((item) => ({
			title: item.title,
			loc: item.link,
			date: item.pubDate,
			description: `${item.kind === 'video' ? 'YouTube' : 'Podcast'} | ${item.title}`,
		}));
}

async function renderRssFeed(
	channel: FeedChannelOptions,
	items: readonly FeedItemInput[],
	expectedPath: string,
): Promise<RenderedFeedFile> {
	const result = await renderFeedFiles(feedInput(channel, items));
	if (result.warning != null) {
		throw new Error(result.warning);
	}

	const feed = result.files.find((file) => file.path === expectedPath);
	if (feed == null) {
		throw new Error(`[site] Ox Content did not render ${expectedPath}`);
	}
	return feed;
}

/**
 * Renders the local blog RSS body without writing it to disk.
 *
 * @param posts - Local blog metadata available to the dev server.
 * @returns The Ox Content RSS file for the root feed route.
 */
export function renderBlogFeed(posts: readonly BlogPostMetadata[]): Promise<RenderedFeedFile> {
	return renderRssFeed(BLOG_FEED_CHANNEL, blogFeedItems(posts), 'feed.xml');
}

/**
 * Renders the curated media RSS body without writing it to disk.
 *
 * @param items - Curated podcast and video appearances.
 * @returns The Ox Content RSS file for the media feed route.
 */
export function renderMediaFeed(items: readonly PostListItem[]): Promise<RenderedFeedFile> {
	return renderRssFeed(MEDIA_FEED_CHANNEL, mediaFeedItems(items), 'works/media/feed.xml');
}

/**
 * Writes the curated media RSS output with Ox Content.
 *
 * @param items - Curated podcast and video appearances.
 * @param outDir - Static site output directory.
 * @returns A promise that resolves after the feed has been written.
 */
export async function writeMediaFeed(
	items: readonly PostListItem[],
	outDir: string,
): Promise<void> {
	const result = await writeFeedFiles({
		...feedInput(MEDIA_FEED_CHANNEL, mediaFeedItems(items)),
		outDir,
	});
	if (result.warning != null) {
		throw new Error(result.warning);
	}
}

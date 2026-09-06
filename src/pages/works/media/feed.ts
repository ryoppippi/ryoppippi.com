import type { FeedChannelOptions, FeedItemInput, RenderedFeedFile } from '@ox-content/vite-plugin';
import type { PostListItem } from '@/pages/post-list.ts';
import { SITE_COPYRIGHT, SITE_NAME, SITE_SOCIAL_IMAGE_URL } from '../../../config/site.ts';
import { renderRssFeed } from '../../../ox-content/feed.ts';

export const MEDIA_FEED_OPTIONS = {
	collection: 'media',
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

/** Maps individual media appearances to feed entries, excluding playlists. */
export function mediaFeedItems(items: readonly PostListItem[]): FeedItemInput[] {
	return items
		.filter((item) => item.playlist !== true)
		.map((item) => ({
			title: item.title,
			loc: item.link,
			date: item.pubDate,
			description: `${item.kind === 'video' ? 'YouTube' : 'Podcast'} | ${item.title}`,
		}));
}

/** Renders the media RSS response for development without writing to disk. */
export function renderMediaFeed(items: readonly PostListItem[]): Promise<RenderedFeedFile> {
	return renderRssFeed(MEDIA_FEED_OPTIONS, mediaFeedItems(items), 'works/media/feed.xml');
}

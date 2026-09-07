import type { FeedChannelOptions, FeedItemInput } from '@ox-content/vite-plugin';
import type { PostListItem } from '@/lib/post-list.ts';
import { SITE_COPYRIGHT, SITE_NAME, SITE_SOCIAL_IMAGE_URL } from '../../../config/site.ts';

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

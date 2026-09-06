import type { BlogPostMetadata } from '@/pages/blog/data.ts';
import type { FeedChannelOptions, FeedItemInput } from '@ox-content/vite-plugin';
import type { PageRoute } from '../route.ts';
import { SITE_COPYRIGHT, SITE_NAME, SITE_SOCIAL_IMAGE_URL } from '../../config/site.ts';
import { renderRssFeed } from '../feed.ts';

export const BLOG_FEED_OPTIONS = {
	collection: 'blog',
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

/** Maps local article metadata to the blog feed's publication policy. */
export function blogFeedItems(posts: readonly BlogPostMetadata[]): FeedItemInput[] {
	return posts.map((post) => ({
		title: post.title,
		path: `blog/${post.filename}`,
		date: post.pubDate,
		description: `${post.title} | ${post.readingTime < 1 ? 'Under a minute' : `${post.readingTime} min read`}`,
		draft: !post.isPublished,
	}));
}

/** Development endpoint; production uses the same options/items via coordinated outputs. */
export const blogFeedRoute = {
	path: '/feed.xml',
	devOnly: true,
	render: async ({ loadBlogPostMetadata }) =>
		renderRssFeed(BLOG_FEED_OPTIONS, blogFeedItems(await loadBlogPostMetadata()), 'feed.xml'),
} satisfies PageRoute;

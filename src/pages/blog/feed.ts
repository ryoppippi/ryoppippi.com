import type { BlogPostMetadata } from '@/pages/blog/data.ts';
import type { FeedChannelOptions, FeedItemInput, RenderedFeedFile } from '@ox-content/vite-plugin';
import { SITE_COPYRIGHT, SITE_NAME, SITE_SOCIAL_IMAGE_URL } from '../../config/site.ts';
import { renderRssFeed } from '../../ox-content/feed.ts';

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

/** Renders the root RSS response for development without writing to disk. */
export function renderBlogFeed(posts: readonly BlogPostMetadata[]): Promise<RenderedFeedFile> {
	return renderRssFeed(BLOG_FEED_OPTIONS, blogFeedItems(posts), 'feed.xml');
}

import type { DevFileRouteModule } from '@/dev-server/route-types.ts';
import { renderBlogFeed } from '@/generation/feeds.ts';
import { createDevRouteResponse } from '@/dev-server/route-types.ts';

export const render: DevFileRouteModule['render'] = async ({ dependencies }) => {
	const feed = await renderBlogFeed(await dependencies.loadBlogPostMetadata());
	return createDevRouteResponse(feed.content, feed.contentType);
};

if (import.meta.vitest != null) {
	it('describes a zero-minute blog RSS estimate as under a minute', async () => {
		const feed = await renderBlogFeed([
			{
				title: 'Quick post',
				filename: 'quick-post',
				filepath: '/content/quick-post.md',
				pubDate: '2026-06-22T00:00:00.000Z',
				lang: 'en',
				isPublished: true,
				readingTime: 0,
			},
		]);
		expect(feed.content).toContain('Under a minute');
		expect(feed.content).not.toContain('0 min read');
	});
}

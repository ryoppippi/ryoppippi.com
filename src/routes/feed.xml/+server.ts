import type { Asset } from '$app/types';
import type { RequestHandler } from './$types';
import { asset, resolve } from '$app/paths';
import { page } from '$app/state';
import { blogPosts } from '$contents/blog' with { type: 'macro' };
import { Feed } from 'feed';

export const prerender = true;

const domain = page.url.origin;

export const GET = (async () => {
	const favicon = asset('/ryoppippi.jpg');

	const feed = new Feed({
		title: `blog | ryoppippi.com`,
		description: `blog | ryoppippi.com`,
		id: domain,
		link: domain,
		language: 'en',
		image: favicon,
		favicon,
		copyright: 'CC BY-NC-SA 4.0 2022-PRESENT © ryoppippi',
		feedLinks: {
			rss: asset(resolve('/feed.xml') as Asset),
		},
	});

	for (const post of blogPosts) {
		if (!post.isPublished) {
			continue;
		}

		const { slug } = post;

		if (slug == null) {
			continue;
		}

		feed.addItem({
			link: asset(resolve('/blog/[slug]', { slug }) as Asset),
			date: new Date(post.pubDate),
			title: post.title,
			description: `${post.title} | ${post.readingTime.text}`,
			// image: //TODO: add og
		});
	}

	return new Response(feed.rss2(), {
		headers: {
			'Content-Type': 'application/xml',
		},
	});
}) satisfies RequestHandler;

import type { RequestHandler } from './$types';
import { asset, resolve } from '$app/paths';
import { blogPosts } from '$contents/blog' with { type: 'macro' };
import { PUBLIC_ORIGIN } from '$env/static/public';
import { Feed } from 'feed';

export const prerender = true;

export const GET = (async () => {
	const favicon = new URL(asset('/ryoppippi.jpg'), PUBLIC_ORIGIN).toString();

	const feed = new Feed({
		title: `blog | ryoppippi.com`,
		description: `blog | ryoppippi.com`,
		id: PUBLIC_ORIGIN,
		link: PUBLIC_ORIGIN,
		language: 'en',
		image: favicon,
		favicon,
		copyright: 'CC BY-NC-SA 4.0 2022-PRESENT © ryoppippi',
		feedLinks: {
			rss: new URL(resolve('/feed.xml'), PUBLIC_ORIGIN).toString(),
		},
	});

	for (const post of blogPosts) {
		if (!post.isPublished) {
			continue;
		}

		const { filename: slug } = post;

		if (slug == null) {
			continue;
		}

		feed.addItem({
			link: new URL(resolve('/blog/[slug]', { slug }), PUBLIC_ORIGIN).toString(),
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

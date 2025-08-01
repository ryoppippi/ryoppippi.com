import type { RequestHandler } from './$types';
import { asset, resolve } from '$app/paths';
import { blogPosts } from '$contents/blog' with { type: 'macro' };
import { PUBLIC_ORIGIN } from '$env/static/public';
import { Feed } from 'feed';
import * as ufo from 'ufo';

export const prerender = true;

export const GET = (async () => {
	const favicon = ufo.joinURL(PUBLIC_ORIGIN, asset('/ryoppippi.jpg'));

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
			rss: ufo.joinURL(PUBLIC_ORIGIN, resolve('/feed.xml')),
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
			link: ufo.joinURL(PUBLIC_ORIGIN, resolve('/blog/[slug]', { slug })),
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

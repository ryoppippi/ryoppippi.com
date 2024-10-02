import { Feed } from 'feed';
import type { RequestHandler } from './$types';
import { domain, subdomain } from '$lib/util';
import { blogPosts } from '$contents/blog';

export const prerender = true;

export const GET = (async () => {
	const favicon = subdomain('ryoppippi.jpg');

	const feed = new Feed({
		title: `blog | ryoppippi.com`,
		description: `blog | ryoppippi.com`,
		id: domain(),
		link: domain(),
		language: 'en',
		image: favicon,
		favicon,
		copyright: `MIT 2024 © ryoppippi`,
		feedLinks: {
			rss: subdomain('blog', 'feed.xml'),
		},
	});

	for (const post of blogPosts) {
		if (!post.isPublished) {
			continue;
		}

		feed.addItem({
			link: subdomain('blog', post.slug),
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

import type { RequestHandler } from './$types';
import { blogPosts } from '$contents/blog';
import { domain, subdomain } from '$lib/util';
import { Feed } from 'feed';

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
		copyright: 'CC BY-NC-SA 4.0 2022-PRESENT © ryoppippi',
		feedLinks: {
			rss: subdomain('feed.xml'),
		},
	});

	for (const post of blogPosts) {
		if (!post.isPublished) {
			continue;
		}
		const slug = post.filepath.split('/').at(-1)?.replace(/\.md$/, '');

		if (slug == null) {
			continue;
		}

		feed.addItem({
			link: subdomain('blog', slug),
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

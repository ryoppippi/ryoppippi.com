import { resolve } from '$app/paths';
import { blogPosts } from '$contents/blog' with { type: 'macro' };
import { posts as rssPosts } from '$contents/external-rss';
import { formatDate } from '$lib/util';
import { parseJSON } from 'date-fns';

import { sort } from 'fast-sort';

export function load() {
	const allPosts = sort([
		...rssPosts,
		...blogPosts,
	].map(item => ({
		...item,
		pubDate: parseJSON(item.pubDate),
	}))).desc(item => item.pubDate);

	const posts = allPosts.map((item) => {
		const pubDate = formatDate(new Date(item.pubDate));
		const link = 'link' in item
			? item.link
			: 'filename' in item && typeof item.filename === 'string'
				? resolve('/blog/[slug]', { slug: item.filename })
				: resolve('/blog/[slug]', { slug: item.slug });
		const external = 'link' in item && item.link.startsWith('http');
		return {
			...item,
			date: pubDate,
			link,
			external,
		};
	});
	return {
		posts,
		allPosts,
		title: 'blog',
	};
}

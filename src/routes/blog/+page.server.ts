import { blogPosts } from '$contents/blog' with { type: 'macro'};
import { posts as rssPosts } from '$contents/external-rss';
import { formatDate } from '$lib/util';
import { parseJSON } from 'date-fns';

import sortOn from 'sort-on';
import * as ufo from 'ufo';

export function load() {
	const allPosts = sortOn([
		...rssPosts,
		...blogPosts,
	].map(item => ({
		...item,
		pubDate: parseJSON(item.pubDate),
	})), ['-pubDate']);

	const posts = allPosts.map((item) => {
		const pubDate = formatDate(new Date(item.pubDate));
		const link = 'link' in item
			? item.link
			: 'filename' in item && typeof item.filename === 'string'
				? ufo.joinURL('/blog', item.filename)
				: ufo.joinURL('/blog', item.slug);
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

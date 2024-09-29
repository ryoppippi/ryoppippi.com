import * as ufo from 'ufo';
import sortOn from 'sort-on';
import { parseJSON } from 'date-fns';
import { formatDate } from '$lib/util';

import { posts as rssPosts } from '$contents/external-rss';
import { posts as blogPosts } from '$contents/blog';

export function load() {
	const allPosts = [...rssPosts, ...blogPosts].map(item => ({ ...item, pubDate: parseJSON(item.pubDate) }));

	const posts = sortOn(allPosts, ['-pubDate']).map((item) => {
		const pubDate = formatDate(new Date(item.pubDate));
		const link = 'link' in item ? item.link : ufo.joinURL('/blog', item.slug);
		const external = 'link' in item && item.link.startsWith('http');
		return {
			...item,
			date: pubDate,
			link,
			external,
		};
	});
	return { posts };
}

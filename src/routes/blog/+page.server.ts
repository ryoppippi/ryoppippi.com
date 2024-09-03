import sortOn from 'sort-on';
import { parseJSON } from 'date-fns';

import { posts as rssPosts } from '$lib/blog/rss';
import { posts as blogPosts } from '$lib/blog/posts';

export function load() {
	const allPosts = [...rssPosts, ...blogPosts].map(item => ({ ...item, pubDate: parseJSON(item.pubDate) }));

	const posts = sortOn(allPosts, ['-pubDate']);
	return { posts };
}

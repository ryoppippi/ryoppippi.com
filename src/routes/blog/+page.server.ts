import sortOn from 'sort-on';
import { parseJSON } from 'date-fns';

import { posts as rssPosts } from '$contents/external-rss';
import { posts as blogPosts } from '$contents/blog';

export function load() {
	const allPosts = [...rssPosts, ...blogPosts].map(item => ({ ...item, pubDate: parseJSON(item.pubDate) }));

	const posts = sortOn(allPosts, ['-pubDate']);
	return { posts };
}

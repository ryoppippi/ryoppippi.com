import sortOn from 'sort-on';
import { parseJSON } from 'date-fns';
import { assert, is } from 'unknownutil';
import { isItem as isItemPost } from '$lib/markdown.server';
import { _isItem as isItemRSS } from '../api/rss.json/+server.js';

export async function load({ fetch }) {
	const rss = fetch('/api/rss.json').then(async (res) => {
		if (!res.ok) throw new Error('Failed to load feed');
		const posts = await res.json();
		assert(posts, is.ArrayOf(isItemRSS));
		return posts;
	});

	const localPosts = fetch('/api/posts.json').then(async (res) => {
		if (!res.ok) throw new Error('Failed to load posts');
		const posts = await res.json();
		assert(posts, is.ArrayOf(isItemPost));
		return posts;
	});

	const posts = await Promise.all([rss, localPosts]).then(([rss, localPosts]) => {
		const posts = [...rss, ...localPosts].map((item) => ({ ...item, pubDate: parseJSON(item.pubDate) }));
		return sortOn(posts, ['-pubDate']);
	});

	return { posts };
}

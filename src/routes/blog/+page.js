import sortOn from 'sort-on';
import { parseJSON } from 'date-fns';

export async function load({ fetch }) {
	const rss = fetch('/api/rss.json').then((res) => {
		if (!res.ok) throw new Error('Failed to load feed');
		return res.json();
	});

	const localPosts = fetch('/api/posts.json').then((res) => {
		if (!res.ok) throw new Error('Failed to load posts');
		return res.json();
	});

	const posts = await Promise.all([rss, localPosts]).then(([rss, localPosts]) => {
		const posts = [...rss, ...localPosts].map((item) => ({ ...item, pubDate: parseJSON(item.pubDate) }));
		return sortOn(posts, ['-pubDate']);
	});

	return { posts };
}

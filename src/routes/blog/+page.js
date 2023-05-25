export async function load({ fetch }) {
	/** @type{ Promise<Readonly<{title: string; link: string; pubDate: string}>[]> } */
	const rss = fetch('/api/rss.json').then((res) => {
		if (!res.ok) throw new Error('Failed to load feed');
		return res.json();
	});

	const localPosts = fetch('/api/posts.json').then((res) => {
		if (!res.ok) throw new Error('Failed to load posts');
		return res.json();
	});

	const posts = await Promise.all([rss, localPosts]).then(([rss, localPosts]) => {
		const posts = [...rss, ...localPosts];
		return posts.sort((first, second) => new Date(second.pubDate).getTime() - new Date(first.pubDate).getTime());
	});

	return { posts };
}

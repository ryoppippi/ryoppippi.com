export async function load({ fetch }) {
	const feed = await fetch('/api/rss.json');
	if (!feed.ok) throw new Error('Failed to load feed');

	/** @type{Readonly<{title: string; link: string; pubDate: string}>[]} */
	const rss = await feed.json();
	return { rss };
}

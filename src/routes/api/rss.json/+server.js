import Parser from 'rss-parser';
import { json } from '@sveltejs/kit';

const parser = new Parser();

export const GET = async () => {
	const feed = await parser.parseURL('https://zenn.dev/ryoppippi/feed');
	return json(
		feed.items.map((item) => {
			return { title: item.title, link: item.link, pubDate: item.pubDate };
		})
	);
};

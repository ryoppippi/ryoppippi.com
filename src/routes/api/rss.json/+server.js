import Parser from 'rss-parser';
import { json } from '@sveltejs/kit';
import rss from './rss.json';
import { is, ensure } from 'unknownutil';

const parser = new Parser();

const isItem = is.ObjectOf({
	title: is.String,
	link: is.String,
	pubDate: is.String
});

export const GET = async () => {
	const feeds = (
		await Promise.all(
			rss.map(async (url) => {
				const feed = await parser.parseURL(url);
				return feed.items.map(({ title, link, pubDate }) => ensure({ title, link, pubDate }, isItem));
			})
		)
	).flat();

	const sortedFeeds = feeds.sort((a, b) => {
		return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
	});

	return json(sortedFeeds);
};

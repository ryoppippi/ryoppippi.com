import Parser from 'rss-parser';
import sortOn from 'sort-on';
import { json } from '@sveltejs/kit';
import { is, ensure } from 'unknownutil';

import rss from './rss.json';

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

	const sortedFeeds = sortOn(feeds, ['-pubDate']);

	return json(sortedFeeds);
};

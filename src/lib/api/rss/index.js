import Parser from 'rss-parser';
import sortOn from 'sort-on';
import { is, ensure } from 'unknownutil';

import rss from './rss.json';

const parser = new Parser();

export const _isItem = is.ObjectOf({
	title: is.String,
	link: is.String,
	pubDate: is.String
});

export const getPosts = async () => {
	const feeds = (
		await Promise.all(
			rss.map(async (url) => {
				const feed = await parser.parseURL(url);
				return feed.items
					.map(({ title, link, pubDate }) => ensure({ title, link, pubDate }, _isItem))
					.map((item) => ({ ...item, pubDate: new Date(item.pubDate).toJSON() }));
			})
		)
	).flat();

	const sortedFeeds = sortOn(feeds, ['-pubDate']);

	return sortedFeeds;
};

export const posts = await getPosts();

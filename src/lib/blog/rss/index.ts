import Parser from 'rss-parser';
import sortOn from 'sort-on';
import typia from 'typia';

import rss from './rss.json';

const parser = new Parser();

type Item = {
	title: string;
	link: string;
	pubDate: string;
};

export async function getPosts() {
	const feeds = (
		await Promise.all(
			rss.map(async (url) => {
				const feed = await parser.parseURL(url);
				return feed.items
					.map(({ title, link, pubDate }) => {
						const item = { title, link, pubDate };
						typia.assertGuard<Item>(item);
						return item;
					})
					.map(item => ({ ...item, pubDate: new Date(item.pubDate).toJSON() }));
			}),
		)
	).flat();

	const sortedFeeds = sortOn(feeds, ['-pubDate']);

	return sortedFeeds;
}

export const posts = await getPosts();

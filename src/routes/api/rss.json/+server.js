import Parser from 'rss-parser';
import { json } from '@sveltejs/kit';
import rss from './rss.json';
import { is, ensure } from 'unknownutil';

const parser = new Parser();

export const GET = async () => {
	const feeds = (
		await Promise.all(
			rss.map(async (url) => {
				const feed = await parser.parseURL(url);
				return feed.items.map((item) => ({ title: item.title, link: item.link, pubDate: item.pubDate }));
			})
		)
	).flat();

	const sortedFeeds = feeds.sort((a, b) => {
		return new Date(ensure(b.pubDate, is.String)).getTime() - new Date(ensure(a.pubDate, is.String)).getTime();
	});

	return json(sortedFeeds);
};

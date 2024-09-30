import Parser from 'rss-parser';
import sortOn from 'sort-on';
import typia from 'typia';

import rss from './rss.json';
import { slugify } from '$lib/util';
import type { Lang } from '$contents/types';

const parser = new Parser();

type Item = {
	title: string;
	slug: string;
	link: string;
	pubDate: string;
	lang: Lang;
};

export async function getPosts() {
	const feeds = (
		await Promise.all(
			rss.map(async (url) => {
				const feed = await parser.parseURL(url);
				return feed.items
					.map(({ pubDate, ...rest }) => ({
						...rest,
						slug: slugify(rest.title ?? ''),
						lang: 'ja',
						pubDate: new Date(pubDate as string).toJSON(),
					}));
			}),
		)
	).flat();

	typia.assertGuard<Item[]>(feeds);

	const sortedFeeds = sortOn(feeds, ['-pubDate']);

	return sortedFeeds;
}

export const posts = await getPosts();

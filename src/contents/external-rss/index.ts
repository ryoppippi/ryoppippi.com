import { Lang } from '$contents/types';
import { slugify } from '$lib/slugify.server';
import { scope } from 'arktype';
import { sort } from 'fast-sort';

import Parser from 'rss-parser';
import rss from './rss.json';

const parser = new Parser();

const { Item } = scope({
	Lang,
	Item: {
		title: 'string',
		slug: 'string',
		link: 'string',
		pubDate: 'string',
		lang: 'Lang',
	},
}).export();

export async function getPosts() {
	const feedItems = await Promise.all(rss.map(async feed => (await parser.parseURL(feed)).items));
	const _feeds = feedItems.flat().map(({ pubDate, ...rest }) => ({
		...rest,
		slug: slugify(rest.title ?? ''),
		lang: 'ja',
		pubDate: new Date(pubDate ?? '').toJSON(),
	}));

	const feeds = Item.array().assert(_feeds);

	const sortedFeeds = sort(feeds).desc(({ pubDate }) => pubDate);

	return sortedFeeds;
}

export const posts = await getPosts();

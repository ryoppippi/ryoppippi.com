/* eslint-disable antfu/no-top-level-await */

import { Lang } from '$contents/types';
import { slugify } from '$lib/slugify.server';
import { flatten, map } from '@core/iterutil/pipe/async';
import { pipe } from '@core/pipe';
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
	const feedsIter = pipe(
		rss,
		map(async feed => parser.parseURL(feed)),
		map(async feed => feed.items),
		flatten,
		map(
			({ pubDate, ...rest }) => ({
				...rest,
				slug: slugify(rest.title ?? ''),
				lang: 'ja',
				pubDate: new Date(pubDate ?? '').toJSON(),
			}),
		),
	);

	const _feeds = await Array.fromAsync(feedsIter);

	const feeds = Item.array().assert(_feeds);

	const sortedFeeds = sort(feeds).desc(({ pubDate }) => pubDate);

	return sortedFeeds;
}

export const posts = await getPosts();

/* eslint-disable antfu/no-top-level-await */

import type { Lang } from '$contents/types';
import { slugify } from '$lib/slugify.server';
import { flatten, map } from '@core/iterutil/pipe/async';
import { pipe } from '@core/pipe';
import Parser from 'rss-parser';

import sortOn from 'sort-on';
import typia from 'typia';
import rss from './rss.json';

const parser = new Parser();

type Item = {
	title: string;
	slug: string;
	link: string;
	pubDate: string;
	lang: Lang;
};

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

	const feeds = await Array.fromAsync(feedsIter);

	typia.assertGuard<Item[]>(feeds);

	const sortedFeeds = sortOn(feeds, ['-pubDate']);

	return sortedFeeds;
}

export const posts = await getPosts();

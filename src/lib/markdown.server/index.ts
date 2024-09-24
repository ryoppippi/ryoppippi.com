import { parse } from 'date-fns';
import typia from 'typia';
import rt from 'reading-time';

import matter from 'gray-matter';

import type { Item, Metadata } from './types';
import { md } from './markdown-it.js';

export async function parseMarkdown(
	mdRaw: string,
	slug: string,
): Promise<Item & { content: string }> {
	const { data: metadata, content: contentRaw } = matter(mdRaw);

	typia.assertGuard<Metadata>(metadata);

	const item = {
		...metadata,
		slug,
		pubDate: parse(metadata.date, 'yyyy-MM-dd', new Date()).toJSON(),
		readingTime: rt(contentRaw),
	} as const satisfies Item;

	typia.assertGuard<Item>(item);

	const content = md.render(contentRaw);

	return { ...item, content };
}

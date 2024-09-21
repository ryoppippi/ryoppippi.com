import { parse } from 'date-fns';
import typia from 'typia';
import rt from 'reading-time';

import matter from 'gray-matter';
import markdownit from 'markdown-it';
import anchor from 'markdown-it-anchor';

import type { Item, Metadata } from './types';
import { slugify } from './slugify';

const md = markdownit({
	html: true,
	linkify: true,
	typographer: true,
});
md.use(anchor, {
	slugify,
	permalink: anchor.permalink.linkInsideHeader({
		symbol: '#',
		renderAttrs: () => ({ 'aria-hidden': 'true' }),
	}),
});

export async function parseMarkdown(
	slug: string,
): Promise<Item & { content: string }> {
	const posts = import.meta.glob(`$posts/*.md`, { eager: true, as: 'raw' });

	const [_, mdRaw] = Object.entries(posts).find(([filepath]) => filepath.endsWith(`/${slug}.md`)) ?? [];
	if (mdRaw == null) {
		throw new Error(`Post not found: ${slug}`);
	}

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

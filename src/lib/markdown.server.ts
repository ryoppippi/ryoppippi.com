import { parse } from 'date-fns';
import typia from 'typia';
import rt from 'reading-time';

import matter from 'gray-matter';
import markdownit from 'markdown-it';

const md = markdownit({
	html: true,
	linkify: true,
	typographer: true,
});

type Item = {
	slug: string;
	title: string;
	pubDate: string;
	isPublished: boolean;
	readingTime: ReturnType<typeof rt>;
};

type Metadata = {
	title: string;
	date: string;
	isPublished: boolean;
	lang: 'en' | 'ja';
};

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

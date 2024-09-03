import matter from 'gray-matter';
import { parse } from 'date-fns';
import typia from 'typia';
import rt from 'reading-time';

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
};

export async function parseMarkdown(
	slug: string,
): Promise<Item & { content: string }> {
	const posts = import.meta.glob(`$posts/*.md`, { eager: true, as: 'raw' });

	const [_, mdRaw] = Object.entries(posts).find(([filepath]) => filepath.endsWith(`/${slug}.md`)) ?? [];
	if (mdRaw == null) {
		throw new Error(`Post not found: ${slug}`);
	}

	const { data: metadata, content } = matter(mdRaw);

	typia.assertGuard<Metadata>(metadata);

	const item = {
		slug,
		title: metadata.title,
		isPublished: metadata.isPublished,
		pubDate: parse(metadata.date, 'yyyy-MM-dd', new Date()).toJSON(),
		readingTime: rt(content),
	} as const satisfies Item;

	typia.assertGuard<Item>(item);

	return { ...item, content };
}

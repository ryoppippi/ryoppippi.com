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

export function parseMarkdown(
	filepath: string,
	contentRaw: string,
): (Item & { content: string }) {
	const filename = filepath.split('/').at(-1);

	/** if not md file, throw error */
	if (filename != null && !filename.endsWith('.md')) {
		throw new Error('File is not a markdown file');
	}

	const slug = filename?.replace('.md', '');

	const { data: metadata, content } = matter(contentRaw);

	typia.assertGuard<Metadata>(metadata);

	const item = {
		slug: slug as string,
		title: metadata.title,
		isPublished: metadata.isPublished,
		pubDate: parse(metadata.date, 'yyyy-MM-dd', new Date()).toJSON(),
		readingTime: rt(content),
	} as const satisfies Item;

	typia.assertGuard<Item>(item);

	return { ...item, content };
}

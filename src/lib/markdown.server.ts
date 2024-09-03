import matter from 'gray-matter';
import { parse } from 'date-fns';
import typia from 'typia';

type Item = {
	slug: string;
	title: string;
	pubDate: string;
	isPublished: boolean;
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
		slug,
		title: metadata.title,
		isPublished: metadata.isPublished,
		pubDate: parse(metadata.date, 'yyyy-MM-dd', new Date()).toJSON(),
	} as const;

	typia.assertGuard<Item>(item);

	return { ...item, content };
}

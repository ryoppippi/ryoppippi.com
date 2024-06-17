import markdown from 'markdown-it';
import matter from 'gray-matter';
import { parse } from 'date-fns';
import typia from 'typia';

interface Item {
	slug: string;
	title: string;
	pubDate: string;
	isPublished: boolean;
}

interface Metadata {
	title: string;
	date: string;
	isPublished: boolean;
}

export function parseMarkdown(
	filepath: string,
	contentRaw: string,
	options: { parseContent: true }
): Item & { content: string };
export function parseMarkdown(filepath: string, contentRaw: string, options?: { parseContent?: false }): Item;
export function parseMarkdown<T extends boolean>(
	filepath: string,
	contentRaw: string,
	options?: {
		parseContent?: T;
	},
): (Item & { content: string }) | Item {
	const filename = filepath.split('/').at(-1);

	/** if not md file, throw error */
	if (filename != null && !filename.endsWith('.md')) {
		throw new Error('File is not a markdown file');
	}

	const slug = filename?.replace('.md', '');

	const { data: metadata, content: parsedRawMdContent } = matter(contentRaw);

	typia.assertGuard<Metadata>(metadata);

	const item = {
		slug,
		title: metadata.title,
		isPublished: metadata.isPublished,
		pubDate: parse(metadata.date, 'yyyy-MM-dd', new Date()).toJSON(),
	} as const;

	typia.assertGuard<Item>(item);

	if (options?.parseContent ?? false) {
		const md = markdown();
		const content = md.render(parsedRawMdContent);

		return { ...item, content };
	}

	return item;
}

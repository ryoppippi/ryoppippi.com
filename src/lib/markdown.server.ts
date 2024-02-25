import markdown from 'markdown-it';
import matter from 'gray-matter';
import { is, assert, type PredicateType } from 'unknownutil';
import { parse } from 'date-fns';

export const isItem = is.ObjectOf({
	slug: is.String,
	title: is.String,
	pubDate: is.String,
	isPublished: is.Boolean
});

export type Item = PredicateType<typeof isItem>;

export const isMetadata = is.ObjectOf({
	title: is.String,
	date: is.String,
	isPublished: is.Boolean
});

export type Metadata = PredicateType<typeof isMetadata>;

export function parseMarkdown(
	filepath: string,
	contentRaw: string,
	options: { parseContent: true }
): Item & { content: string };
export function parseMarkdown(filepath: string, contentRaw: string, options?: { parseContent?: false }): Item;
export function parseMarkdown<T extends boolean | undefined>(
	filepath: string,
	contentRaw: string,
	options?: {
		parseContent?: T;
	}
): (Item & { content: string }) | Item {
	const filename = filepath.split('/').at(-1);

	/** if not md file, throw error */
	if (!filename?.endsWith('.md')) {
		throw new Error('File is not a markdown file');
	}

	const slug = filename?.replace('.md', '');

	const { data: metadata, content: parsedRawMdContent } = matter(contentRaw);

	assert(metadata, isMetadata);

	const item = {
		slug,
		title: metadata.title,
		isPublished: metadata.isPublished,
		pubDate: parse(metadata.date, 'yyyy-MM-dd', new Date()).toJSON()
	} satisfies Item;

	assert(item, isItem);

	if (options?.parseContent) {
		const md = markdown();
		const content = md.render(parsedRawMdContent);

		return { ...item, content };
	}

	return item;
}

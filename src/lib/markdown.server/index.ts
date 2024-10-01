import { parse } from 'date-fns';
import typia from 'typia';
import rt from 'reading-time';

import matter from 'gray-matter';
import { md } from './markdown-it.js';

export async function parseMarkdown<Metadata extends { [key: string]: unknown }>(
	mdRaw: string,
): Promise<Omit<Metadata, 'date'> & {
	content: string;
	readingTime: ReturnType<typeof rt>;
	pubDate: string | undefined;
}> {
	const {
		data,
		content: contentRaw,
	} = matter(mdRaw);

	const { date, ...metadataRest } = data as Metadata;
	const pubDate = typia.is<Date>(date)
		? date.toJSON()
		: typia.is<string>(date)
			? parse(date, 'yyyy-MM-dd', new Date()).toJSON()
			: undefined;
	const readingTime = rt(contentRaw);
	const content = md.render(contentRaw);

	return {
		...metadataRest,
		pubDate,
		readingTime,
		content,
	};
}

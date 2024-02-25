import sortOn from 'sort-on';
import { is, ensure, assert } from 'unknownutil';
import { json } from '@sveltejs/kit';
import { parse } from 'date-fns';

import markdown from 'markdown-it';
import matter from 'gray-matter';

export const _isItem = is.ObjectOf({
	slug: is.String,
	title: is.String,
	pubDate: is.String
});

export const _isMetadata = is.ObjectOf({
	title: is.String,
	date: is.String
});

const mdParser = new markdown();

async function getPosts() {
	let posts = ensure([], is.ArrayOf(_isItem));

	const paths = import.meta.glob('/src/posts/*.md', { eager: true, as: 'raw' });

	Object.entries(paths).forEach(([filepath, contentRaw]) => {
		const slug = filepath.split('/').at(-1)?.replace('.md', '');

		/** parse markdown and convert to html */
		const content = mdParser.render(contentRaw);

		/** parse metadata */
		const { data: metadata } = matter(contentRaw);
		assert(metadata, _isMetadata);

		if (content !== '') {
			const post = {
				slug,
				title: metadata.title,
				pubDate: parse(metadata.date, 'yyyy-MM-dd', new Date()).toJSON()
			};
			assert(post, _isItem);
			posts = [...posts, post];
		}
	});

	posts = sortOn(posts, ['-pubDate']);

	return posts;
}

export async function GET() {
	const posts = await getPosts();
	return json(posts);
}

export const prerender = true;

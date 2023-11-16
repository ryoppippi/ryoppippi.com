import sortOn from 'sort-on';
import { is, ensure } from 'unknownutil';
import { json } from '@sveltejs/kit';
import { parse } from 'date-fns';

const isItem = is.ObjectOf({
	slug: is.String,
	title: is.String,
	pubDate: is.String
});

async function getPosts() {
	let posts = ensure([], is.ArrayOf(isItem));

	const paths = import.meta.glob('/src/posts/*.md', { eager: true });

	for (const path in paths) {
		const file = paths[path];
		const slug = path.split('/').at(-1)?.replace('.md', '');

		if (file && typeof file === 'object' && 'metadata' in file && slug) {
			/** @type {?} */
			const metadata = file.metadata;
			const post = ensure(
				{
					slug,
					title: metadata.title,
					pubDate: parse(metadata.date, 'yyyy-MM-dd', new Date()).toJSON()
				},
				isItem
			);
			posts = [...posts, post];
		}
	}

	posts = sortOn(posts, ['-pubDate']);

	return posts;
}

export async function GET() {
	const posts = await getPosts();
	return json(posts);
}

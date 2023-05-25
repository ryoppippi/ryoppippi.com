import { json } from '@sveltejs/kit';

async function getPosts() {
	/** @type {Post[]} */
	let posts = [];

	const paths = import.meta.glob('/src/posts/*.md', { eager: true });

	for (const path in paths) {
		const file = paths[path];
		const slug = path.split('/').at(-1)?.replace('.md', '');

		if (file && typeof file === 'object' && 'metadata' in file && slug) {
			/** @type {?} */
			const metadata = file.metadata;
			/** @satisfies {Post} */
			const post = { ...metadata, slug };
			posts = [...posts, post];
		}
	}

	posts = posts.sort((first, second) => new Date(second.pubDate).getTime() - new Date(first.pubDate).getTime());

	return posts;
}

export async function GET() {
	const posts = await getPosts();
	return json(posts);
}

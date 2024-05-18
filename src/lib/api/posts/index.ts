import sortOn from 'sort-on';

import { parseMarkdown } from '$lib/markdown.server';

async function getPosts() {
	const originals = import.meta.glob('/src/posts/*.md', { eager: true, as: 'raw' });

	const posts = Object.entries(originals).flatMap(([filepath, contentRaw]) => {
		const post = parseMarkdown(filepath, contentRaw);
		if (!post.isPublished) {
			return [];
		}

		return post;
	});

	const sortedPost = sortOn(posts, ['-pubDate']);

	return sortedPost;
}

export const posts = await getPosts();

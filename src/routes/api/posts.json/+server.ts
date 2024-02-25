import sortOn from 'sort-on';
import { json } from '@sveltejs/kit';

import { parseMarkdown } from '$lib/markdown.server';

async function getPosts() {
	const originals = import.meta.glob('/src/posts/*.md', { eager: true, as: 'raw' });

	const posts = Object.entries(originals).flatMap(([filepath, contentRaw]) => {
		const post = parseMarkdown(filepath, contentRaw, { parseContent: false });
		if (!post.isPublished) {
			return [];
		}

		return post;
	});

	const sortedPost = sortOn(posts, ['-pubDate']);

	return sortedPost;
}

export async function GET() {
	const posts = await getPosts();
	return json(posts);
}

export const prerender = true;

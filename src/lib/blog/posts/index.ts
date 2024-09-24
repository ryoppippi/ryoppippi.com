import sortOn from 'sort-on';

import { parseMarkdown } from '$lib/markdown.server';

async function getPosts() {
	const originals = import.meta.glob('$contents/blog/*.md', { eager: true, as: 'raw' });

	const posts = await Promise.all(Object.entries(originals).map(async ([filepath, mdRaw]) => {
		const slug = filepath.split('/').at(-1)?.replace('.md', '');
		if (slug == null) {
			return undefined;
		}
		const post = await parseMarkdown(mdRaw, slug);
		if (!post.isPublished) {
			return undefined;
		}

		return post;
	})).then(ps => ps.filter(p => p != null));

	const sortedPost = sortOn(posts, ['-pubDate']);

	return sortedPost;
}

export const posts = await getPosts();

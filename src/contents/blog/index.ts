import sortOn from 'sort-on';
import typia from 'typia';
import type { Item, Metadata } from '$contents/blog/types';

import { parseMarkdown } from '$lib/markdown.server';

async function getPosts() {
	const originals = import.meta.glob('$contents/blog/*.md', { eager: true, as: 'raw' });

	const posts = await Promise.all(Object.entries(originals).map(async ([filepath, mdRaw]) => {
		const slug = filepath.split('/').at(-1)?.replace('.md', '');
		if (slug == null) {
			return;
		}
		try {
			const metadata = await parseMarkdown<Metadata>(mdRaw);

			if (metadata.isPublished) {
				return typia.assert<Item>({
					...metadata,
					slug,
				});
			}
		}
		catch (e) {
			console.error(e);
		}
	})).then(ps => ps.filter(p => p != null));

	const sortedPost = sortOn(posts, ['-pubDate']);

	return sortedPost;
}

export const posts = await getPosts();

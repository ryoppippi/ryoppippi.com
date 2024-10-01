import path from 'node:path';
import sortOn from 'sort-on';
import fs from 'fs-extra';
import typia from 'typia';
import type { Item, Metadata } from '$contents/blog/types';

import { parseMarkdown } from '$lib/markdown.server';
import { dev } from '$app/environment';

async function getPosts() {
	const originals = import.meta.glob('$contents/blog/*.md', { eager: true, as: 'raw' });

	const posts = await Promise.all(Object.entries(originals).map(async ([filepath, mdRaw]) => {
		const slug = filepath.split('/').at(-1)?.replace('.md', '');
		if (slug == null) {
			return;
		}
		try {
			const metadata = await parseMarkdown<Metadata>(mdRaw);

			if (dev || metadata.isPublished) {
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

export async function getPost(slug: string) {
	try {
		const mdRaw = await fs.readFile(path.resolve(`src/contents/blog/${slug}.md`), 'utf-8');
		const { content, ...metadata } = await parseMarkdown(mdRaw);
		typia.assertGuard<Metadata>(metadata);

		const item = typia.assert<Item>({
			...metadata,
			slug,
		});

		return { ...item, content };
	}
	catch (e) {
		console.error(`Post not found: ${slug}`);
		throw e;
	}
}

export const posts = await getPosts();

import path from 'node:path';
import typia from 'typia';
import { error } from '@sveltejs/kit';
import fs from 'fs-extra';
import type { Item, Metadata } from '$contents/blog/types';
import { parseMarkdown } from '$lib/markdown.server';

export async function load({ params: { slug } }) {
	try {
		const mdRaw = await fs.readFile(path.resolve(`src/contents/blog/${slug}.md`), 'utf-8');
		const { content, ...metadata } = await parseMarkdown(mdRaw);
		typia.assertGuard<Metadata>(metadata);

		const item = typia.assert<Item>({
			...metadata,
			slug: slug as string,
		});

		return { ...item, content };
	}
	catch (e) {
		console.error(e);
		return error(404, 'Post not found');
	}
}

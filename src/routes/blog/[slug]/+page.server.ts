import path from 'node:path';
import { error } from '@sveltejs/kit';
import fs from 'fs-extra';
import { parseMarkdown } from '$lib/markdown.server';

export async function load({ params: { slug } }) {
	try {
		const mdRaw = await fs.readFile(path.resolve(`src/contents/blog/${slug}.md`), 'utf-8');
		return await parseMarkdown(mdRaw, slug as string);
	}
	catch (e) {
		console.error(e);
		return error(404, 'Post not found');
	}
}

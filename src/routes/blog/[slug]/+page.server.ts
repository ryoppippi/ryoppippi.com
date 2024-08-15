import path from 'node:path';
import { error } from '@sveltejs/kit';
import fs from 'fs-extra';
import { parseMarkdown } from '$lib/markdown.server.js';

export async function load({ params: { slug } }) {
	console.log({ url: import.meta.url }); // eslint-disable-line no-console

	const filePath = path.resolve(import.meta.dirname, `../../../posts/${slug}.md`);

	if (!fs.existsSync(filePath)) {
		return error(404, 'Not found');
	}

	const mdRaw = await fs.readFile(filePath, 'utf-8');

	return parseMarkdown(filePath, mdRaw);
}

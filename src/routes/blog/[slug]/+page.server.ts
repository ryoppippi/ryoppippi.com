import { error } from '@sveltejs/kit';
import { parseMarkdown } from '$lib/markdown.server.js';

export async function load({ params: { slug } }) {
	console.log({ url: import.meta.url });
	const filepath = `/src/posts/${slug}.md` as const;
	const { default: contentRaw } = await import(`./../../../posts/${slug}.md?raw`);
	try {
		const { content, ...meta } = parseMarkdown(filepath, contentRaw, { parseContent: true });

		if (!meta.isPublished) {
			throw new Error('Post not found');
		}

		return { content, meta };
	} catch (e) {
		console.error(e);
		error(404, 'Post not found');
	}
}

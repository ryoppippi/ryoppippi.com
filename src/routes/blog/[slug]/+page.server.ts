import { error } from '@sveltejs/kit';
import { parseMarkdown } from '$lib/markdown.server.js';

export async function load({ params: { slug } }) {
	console.log({ url: import.meta.url }); // eslint-disable-line no-console
	const filepath = `/src/posts/${slug}.md` as const;
	const contentRaw = (await import(`./../../../posts/${slug}.md?raw`)).default as string; // eslint-disable-line ts/no-unsafe-member-access
	try {
		const { content, ...meta } = parseMarkdown(filepath, contentRaw, {
			parseContent: true,
		});

		if (!meta.isPublished) {
			throw new Error('Post not found');
		}

		return { content, meta };
	}
	catch (e) {
		console.error(e);
		error(404, 'Post not found');
	}
}

import { error } from '@sveltejs/kit';
import { parseMarkdown } from '$lib/markdown.server';

export async function load({ params: { slug } }) {
	try {
		return await parseMarkdown(slug as string);
	}
	catch (e) {
		console.error(e);
		return error(404, 'Post not found');
	}
}

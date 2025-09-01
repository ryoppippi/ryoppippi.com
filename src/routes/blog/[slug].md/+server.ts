import type { Metadata } from '$contents/blog/types';
import type { MarkdownImport } from '../../../markdown';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

export const prerender = true;

export const GET: RequestHandler = async ({ params: { slug } }) => {
	try {
		// Verify the blog post exists by importing it
		await import(`../../../contents/blog/${slug}.md`) as unknown as MarkdownImport<Metadata>;

		// Import the raw markdown content
		const rawMd = await import(`../../../contents/blog/${slug}.md?raw`) as { default: string };

		return new Response(new TextEncoder().encode(rawMd.default), {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	}
	catch (e) {
		console.error(e);
		error(404, 'Post not found');
	}
};

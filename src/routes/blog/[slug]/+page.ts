import { error } from '@sveltejs/kit';
import type { MarkdownImport } from '../../../markdown';
import type { PageLoad } from './$types';
import type { Metadata } from '$contents/blog/types';

export const load: PageLoad = async ({ params: { slug } }) => {
	try {
		const md = await import(`../../../contents/blog/${slug}.md`) as unknown as MarkdownImport<Metadata>;

		return {
			metadata: md.metadata,
			Markdown: md.default,
			slug,
		};
	}
	catch (e) {
		console.error(e);
		return error(404, 'Post not found');
	}
};

import type { Metadata } from '$contents/blog/types';
import type { MarkdownImport } from '../../../markdown';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params: { slug } }) => {
	try {
		const md = await import(`../../../contents/blog/${slug}.md`) as unknown as MarkdownImport<Metadata>;

		return {
			metadata: md.metadata,
			Markdown: md.default,
			slug,
			title: `${md.metadata.title} | blog`,
		};
	}
	catch (e) {
		console.error(e);
		return error(404, 'Post not found');
	}
};

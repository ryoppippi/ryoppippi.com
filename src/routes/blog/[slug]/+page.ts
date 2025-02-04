import type { Metadata } from '@ryoppippi.com/blog';
import type { MarkdownImport } from '@ryoppippi.com/markdown';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ params: { slug } }) => {
	try {
		const md = await import(`@ryoppippi.com/blog/dist/${slug}.svelte`) as unknown as MarkdownImport<Metadata>;

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
}) satisfies PageLoad;

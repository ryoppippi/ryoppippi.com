import type { Metadata } from '$contents/blog/types';
import type { MarkdownImport } from '../../../markdown';
import type { PageLoad } from './$types';
import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';

async function tryImportMarkdown(slug: string): Promise<MarkdownImport<Metadata>> {
	// Try directory structure first: slug/index.md
	try {
		return await import(`../../../contents/blog/${slug}/index.md`) as unknown as MarkdownImport<Metadata>;
	}
	catch {
		// Fall back to flat structure: slug.md
		return await import(`../../../contents/blog/${slug}.md`) as unknown as MarkdownImport<Metadata>;
	}
}

export const load = (async ({ params: { slug } }) => {
	try {
		const md = await tryImportMarkdown(slug);

		if (!dev && !md.metadata.isPublished) {
			return error(404, 'Post not found');
		}

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

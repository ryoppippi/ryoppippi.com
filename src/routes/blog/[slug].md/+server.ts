import type { Metadata } from '$contents/blog/types';
import type { MarkdownImport } from '../../../markdown';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

export const prerender = true;

async function tryImportMarkdown(slug: string): Promise<{ md: MarkdownImport<Metadata>; raw: string }> {
	// Try directory structure first: slug/index.md
	try {
		const md = await import(`../../../contents/blog/${slug}/index.md`) as unknown as MarkdownImport<Metadata>;
		const rawMd = await import(`../../../contents/blog/${slug}/index.md?raw`) as { default: string };
		return { md, raw: rawMd.default };
	}
	catch {
		// Fall back to flat structure: slug.md
		const md = await import(`../../../contents/blog/${slug}.md`) as unknown as MarkdownImport<Metadata>;
		const rawMd = await import(`../../../contents/blog/${slug}.md?raw`) as { default: string };
		return { md, raw: rawMd.default };
	}
}

export const GET: RequestHandler = async ({ params: { slug } }) => {
	try {
		const { raw } = await tryImportMarkdown(slug);

		return new Response(raw, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
			},
		});
	}
	catch (e) {
		console.error(e);
		error(404, 'Post not found');
	}
};

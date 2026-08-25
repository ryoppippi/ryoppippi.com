import type { Plugin } from 'vite';
import { oxContent } from '@ox-content/vite-plugin';

type MarkdownTransform = (code: string, id: string) => Promise<{ code: string } | null | undefined>;

function markdownTransform(plugin: Plugin): MarkdownTransform {
	if (typeof plugin.transform !== 'function') {
		throw new TypeError('Ox Content Markdown transform is unavailable');
	}
	return plugin.transform as MarkdownTransform;
}

const transform = markdownTransform(
	oxContent({
		embeds: false,
		frontmatter: false,
		headingPermalinks: true,
		highlight: true,
		ogViewer: false,
		search: false,
		semanticFootnotes: true,
		ssg: false,
		toc: false,
	})[0],
);

/**
 * Renders Markdown with Ox Content's native tree-sitter syntax highlighting.
 *
 * @param content - Markdown source to render.
 * @returns Rendered HTML with supported fenced languages highlighted.
 * @example
 * await renderHighlightedMarkdown('```ts\nconst answer = 42;\n```');
 */
export async function renderHighlightedMarkdown(content: string): Promise<string> {
	const result = await transform(content, '/virtual/article.md');
	if (result == null) {
		throw new Error('Ox Content did not transform Markdown');
	}
	const prefix = 'export const html = ';
	const start = result.code.indexOf(prefix);
	const end = result.code.indexOf(';\n', start + prefix.length);
	if (start === -1 || end === -1) {
		throw new TypeError('Ox Content generated an invalid Markdown module');
	}
	const html: unknown = JSON.parse(result.code.slice(start + prefix.length, end));
	if (typeof html !== 'string') {
		throw new TypeError('Ox Content generated invalid HTML');
	}
	return html;
}

if (import.meta.vitest != null) {
	describe(renderHighlightedMarkdown, () => {
		it('uses Ox Content native highlighting for supported languages', async () => {
			const html = await renderHighlightedMarkdown('```ts\nconst answer = 42;\n```');

			expect(html).toContain('class="ox-highlight css-variables"');
			expect(html).toContain('data-language="ts"');
			expect(html).toContain('--octc-syntax-');
			expect(html).toContain('tabindex="0"');
		});
	});
}

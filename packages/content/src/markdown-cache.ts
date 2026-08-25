import type { IslandRenderer, RenderMarkdownOptions } from './markdown/render.ts';
import { renderMarkdown } from './markdown/render.ts';

export type MarkdownRenderer = (
	content: string,
	options?: Omit<RenderMarkdownOptions, 'renderIsland'>,
) => Promise<string>;

/**
 * Creates a Markdown renderer that reuses results for identical source and options.
 *
 * @param renderIsland - Optional server renderer for document-local islands.
 * @returns A cached Markdown renderer.
 */
export function createMarkdownRenderer(renderIsland?: IslandRenderer): MarkdownRenderer {
	const memoryCache = new Map<string, Promise<string>>();

	return async (content, options) => {
		const key = JSON.stringify([content, options ?? null]);
		const cached = memoryCache.get(key);
		if (cached != null) {
			return cached;
		}

		const pending = renderMarkdown(content, { ...options, renderIsland });
		memoryCache.set(key, pending);
		return pending;
	};
}

if (import.meta.vitest != null) {
	describe(createMarkdownRenderer, () => {
		it('does not reuse plain Markdown HTML for MDX source with the same text', async () => {
			const render = createMarkdownRenderer();

			const markdown = await render('Hello {name}');
			const mdx = await render('Hello {name}', { mdx: true });

			expect(markdown).toContain('{name}');
			expect(mdx).not.toContain('{name}');
		});
	});
}

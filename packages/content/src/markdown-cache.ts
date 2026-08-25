import type { IslandRenderer, RenderMarkdownOptions } from './markdown/render.ts';
import { renderMarkdown } from './markdown/render.ts';

export type MarkdownRenderer = (
	content: string,
	options?: Omit<RenderMarkdownOptions, 'renderIsland'>,
) => Promise<string>;

export function createMarkdownRenderer(renderIsland?: IslandRenderer): MarkdownRenderer {
	const memoryCache = new Map<string, Promise<string>>();

	return async (content, options) => {
		const cached = memoryCache.get(content);
		if (cached != null) {
			return cached;
		}

		const pending = renderMarkdown(content, { ...options, renderIsland });
		memoryCache.set(content, pending);
		return pending;
	};
}

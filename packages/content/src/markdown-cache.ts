import type { IslandRenderer, RenderMarkdownOptions, TweetRenderer } from './markdown/render.ts';
import { renderMarkdown } from './markdown/render.ts';

export type MarkdownRenderer = (
	content: string,
	options?: Omit<RenderMarkdownOptions, 'renderIsland' | 'renderTweet'>,
) => Promise<string>;

const rendererCaches = new WeakMap<TweetRenderer, Map<string, Promise<string>>>();

export function createMarkdownRenderer(
	renderTweet: TweetRenderer,
	renderIsland?: IslandRenderer,
): MarkdownRenderer {
	const memoryCache = rendererCaches.get(renderTweet) ?? new Map<string, Promise<string>>();
	rendererCaches.set(renderTweet, memoryCache);

	return async (content, options) => {
		const cached = memoryCache.get(content);
		if (cached != null) {
			return cached;
		}

		const pending = renderMarkdown(content, { ...options, renderIsland, renderTweet });
		memoryCache.set(content, pending);
		return pending;
	};
}

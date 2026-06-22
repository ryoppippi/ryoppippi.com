import type { RenderMarkdownOptions, TweetRenderer } from './markdown/render.ts';
import { renderMarkdown } from './markdown/render.ts';

export type MarkdownRenderer = (
	content: string,
	options?: Omit<RenderMarkdownOptions, 'renderTweet'>,
) => Promise<string>;

const rendererCaches = new WeakMap<TweetRenderer, Map<string, Promise<string>>>();

export function createMarkdownRenderer(renderTweet: TweetRenderer): MarkdownRenderer {
	const memoryCache = rendererCaches.get(renderTweet) ?? new Map<string, Promise<string>>();
	rendererCaches.set(renderTweet, memoryCache);

	return async (content, options) => {
		const cached = memoryCache.get(content);
		if (cached != null) {
			return cached;
		}

		const pending = renderMarkdown(content, { ...options, renderTweet });
		memoryCache.set(content, pending);
		return pending;
	};
}

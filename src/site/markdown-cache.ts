import type { TweetRenderer } from '../markdown/render.ts';
import { renderMarkdown } from '../markdown/render.ts';

export type MarkdownRenderer = (content: string) => Promise<string>;

const rendererCaches = new WeakMap<TweetRenderer, Map<string, Promise<string>>>();

export function createMarkdownRenderer(renderTweet: TweetRenderer): MarkdownRenderer {
	const memoryCache = rendererCaches.get(renderTweet) ?? new Map<string, Promise<string>>();
	rendererCaches.set(renderTweet, memoryCache);

	return async (content) => {
		const cached = memoryCache.get(content);
		if (cached != null) {
			return cached;
		}

		const pending = renderMarkdown(content, { renderTweet });
		memoryCache.set(content, pending);
		return pending;
	};
}

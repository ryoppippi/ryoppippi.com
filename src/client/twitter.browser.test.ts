import { initTweetCards } from '@ox-content/vite-plugin/twitter/client';
import { userEvent } from 'vitest/browser';
import '@/pages/blog/article/ArticleContent.css';

const TWEET_URL = 'https://x.com/ryoppippi/status/1941072675872641440';

describe('Tweet copy action', () => {
	it('copies the post URL after the document initialises', async () => {
		const nextBody = document.createElement('body');
		nextBody.innerHTML = `
			<a
				href="${TWEET_URL}"
				data-ox-tweet-copy
				data-ox-tweet-copy-url="${TWEET_URL}"
				aria-label="Copy link to post"
			>
				<span>Copy link</span>
				<span data-ox-tweet-copy-status></span>
			</a>
		`;
		document.body.replaceWith(nextBody);

		initTweetCards(document);
		const copyLink = document.querySelector<HTMLAnchorElement>('[data-ox-tweet-copy]');
		assert.isNotNull(copyLink, 'expected a Tweet Copy link');
		await userEvent.click(copyLink);

		await expect.poll(() => copyLink.ariaLabel).toBe('Copied!');
		await expect.poll(() => navigator.clipboard.readText()).toBe(TWEET_URL);
	});
});

describe('Tweet avatar shapes', () => {
	it('preserves Circle and Square profiles inside article prose', () => {
		const nextBody = document.createElement('body');
		nextBody.innerHTML = `
			<article class="prose">
				<figure class="ox-tweet ox-tweet--full">
					<img class="ox-tweet__avatar ox-tweet__avatar--circle" alt="Circle profile" />
					<img class="ox-tweet__avatar ox-tweet__avatar--square" alt="Square profile" />
				</figure>
			</article>
		`;
		document.body.replaceWith(nextBody);

		const circle = document.querySelector<HTMLImageElement>('[alt="Circle profile"]');
		const square = document.querySelector<HTMLImageElement>('[alt="Square profile"]');
		assert.isNotNull(circle);
		assert.isNotNull(square);
		expect(getComputedStyle(circle).borderRadius).toBe('9999px');
		expect(getComputedStyle(square).borderRadius).toBe('4px');
	});
});

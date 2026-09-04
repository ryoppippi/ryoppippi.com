import { initTweetCards } from '@ox-content/vite-plugin/twitter/client';
import { userEvent } from 'vitest/browser';

const TWEET_URL = 'https://x.com/ryoppippi/status/1941072675872641440';

describe('Tweet copy action', () => {
	it('copies the post URL after the document initializes', async () => {
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

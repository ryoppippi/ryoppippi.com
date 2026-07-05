import type { TweetData } from './tweet-renderer.ts';
import { getTweet } from 'sveltweet/api';

async function fetchVercelTweet(id: string): Promise<TweetData | null> {
	try {
		const response = await fetch(`https://react-tweet.vercel.app/api/tweet/${id}`);
		if (response.ok) {
			const body = (await response.json()) as { data?: TweetData };
			return body.data ?? null;
		}
	} catch {}
	return null;
}

/**
 * Fetches tweet data for embedding, trying the Vercel react-tweet API first
 * and falling back to the Twitter syndication API with retries.
 *
 * @param id - The numeric tweet ID
 * @returns The tweet data, or `null` when the tweet is unavailable
 */
export async function fetchTweet(id: string): Promise<TweetData | null> {
	const vercelTweet = await fetchVercelTweet(id);
	if (vercelTweet != null) {
		return vercelTweet;
	}

	for (let attempt = 0; attempt < 3; attempt += 1) {
		try {
			const tweet = await getTweet(id);
			if (tweet != null) {
				return tweet;
			}
		} catch {
			if (attempt < 2) {
				await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
			}
		}
	}
	return null;
}

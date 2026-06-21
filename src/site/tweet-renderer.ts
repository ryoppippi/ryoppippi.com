import type { getTweet as getTweetType } from 'sveltweet/api';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { render } from 'svelte/server';
import { getTweet } from 'sveltweet/api';
import Tweet from './Tweet.svelte';

type TweetData = NonNullable<Awaited<ReturnType<typeof getTweetType>>>;

type TweetLike = {
	entities?: {
		hashtags?: unknown[];
		media?: unknown[];
		symbols?: unknown[];
		urls?: unknown[];
		user_mentions?: unknown[];
	};
	parent?: TweetLike;
	quoted_tweet?: TweetLike;
};

const tweetCache = new Map<string, Promise<TweetData | null>>();
const cacheDirectory = path.join(process.cwd(), 'node_modules/.cache/ryoppippi-tweets/v1');

function normaliseEntities(tweet: TweetLike | null | undefined): void {
	if (tweet == null) {
		return;
	}

	const entities = tweet.entities ?? {};
	tweet.entities = {
		...entities,
		hashtags: entities.hashtags ?? [],
		symbols: entities.symbols ?? [],
		urls: entities.urls ?? [],
		user_mentions: entities.user_mentions ?? [],
	};
	normaliseEntities(tweet.parent);
	normaliseEntities(tweet.quoted_tweet);
}

async function fetchFallbackTweet(id: string): Promise<TweetData | null> {
	const response = await fetch(`https://react-tweet.vercel.app/api/tweet/${id}`);
	if (!response.ok) {
		return null;
	}

	const body = (await response.json()) as { data?: TweetData };
	return body.data ?? null;
}

async function fetchTweet(id: string): Promise<TweetData | null> {
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

	try {
		return await fetchFallbackTweet(id);
	} catch {
		return null;
	}
}

async function loadPersistentTweet(id: string): Promise<TweetData | null> {
	try {
		return JSON.parse(await readFile(path.join(cacheDirectory, `${id}.json`), 'utf8')) as TweetData;
	} catch {
		return null;
	}
}

async function fetchAndCacheTweet(id: string): Promise<TweetData | null> {
	const stored = await loadPersistentTweet(id);
	if (stored != null) {
		return stored;
	}

	const tweet = await fetchTweet(id);
	if (tweet != null) {
		await mkdir(cacheDirectory, { recursive: true });
		await writeFile(path.join(cacheDirectory, `${id}.json`), JSON.stringify(tweet));
	}
	return tweet;
}

export async function loadTweet(id: string): Promise<TweetData | null> {
	const cached = tweetCache.get(id);
	if (cached != null) {
		return cached;
	}

	const pending = fetchAndCacheTweet(id);
	tweetCache.set(id, pending);
	return pending;
}

export async function renderTweet(id: string): Promise<string> {
	const tweet = await loadTweet(id);
	normaliseEntities(tweet as TweetLike | null);
	const rendered = render(Tweet, { props: { id, tweet: tweet ?? undefined } });
	const data =
		tweet == null
			? ''
			: `<script type="application/json" data-tweet-props>${JSON.stringify(tweet).replaceAll('<', '\\u003c')}</script>`;
	return `<div class="sveltweet-ssg" data-tweet-id="${id}"><div data-tweet-root>${rendered.body}</div>${data}</div>`;
}

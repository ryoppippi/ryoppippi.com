import type { getTweet as getTweetType } from 'sveltweet/api';
import { render } from 'svelte/server';
import Tweet from './Tweet.svelte';

export type TweetData = NonNullable<Awaited<ReturnType<typeof getTweetType>>>;

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

const renderedTweetCache = new Map<string, Promise<string>>();

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

async function renderTweetHtml(id: string, tweet?: TweetData): Promise<string> {
	normaliseEntities(tweet as TweetLike | undefined);
	const rendered = render(Tweet, { props: { id, tweet } });
	const data =
		tweet == null
			? ''
			: `<script type="application/json" data-tweet-props>${JSON.stringify(tweet).replaceAll('<', '\\u003c')}</script>`;
	return `<div class="sveltweet-ssg" data-tweet-id="${id}"><div data-tweet-root>${rendered.body}</div>${data}</div>`;
}

export function renderTweet(id: string, tweet?: TweetData): Promise<string> {
	const cacheKey = tweet == null ? `${id}:fallback` : id;
	const cached = renderedTweetCache.get(cacheKey);
	if (cached != null) {
		return cached;
	}

	const pending = renderTweetHtml(id, tweet);
	renderedTweetCache.set(cacheKey, pending);
	return pending;
}

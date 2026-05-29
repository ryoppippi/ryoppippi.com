import { prerender } from '$app/server';
import { error } from '@sveltejs/kit';
import { type } from 'arktype';
import * as sveltweet from 'sveltweet/api';

const getTweetPropsSchema = type({
	id: 'string',
});

type TweetEntities = {
	hashtags?: unknown[];
	user_mentions?: unknown[];
	urls?: unknown[];
	symbols?: unknown[];
	media?: unknown[];
};

type TweetLike = {
	entities?: TweetEntities;
	parent?: TweetLike;
	quoted_tweet?: TweetLike;
};

/**
 * Backfill empty entity arrays on a tweet-like object.
 *
 * The syndication API now omits entity arrays when empty
 * (hashtags / user_mentions / urls / symbols), but sveltweet's
 * enrichTweet iterates them unconditionally and throws
 * "entities is not iterable". Walk the tweet, its parent, and any
 * quoted_tweet so every embedded tweet has the expected shape.
 */
function backfillEntities(tweet: TweetLike | null | undefined): void {
	if (tweet == null) {
		return;
	}
	const entities = tweet.entities ?? {};
	tweet.entities = {
		...entities,
		hashtags: entities.hashtags ?? [],
		user_mentions: entities.user_mentions ?? [],
		urls: entities.urls ?? [],
		symbols: entities.symbols ?? [],
	};
	backfillEntities(tweet.parent);
	backfillEntities(tweet.quoted_tweet);
}

/**
 * Remote function to fetch a tweet
 * @see https://svelte.dev/docs/kit/remote-functions
 */
export const getTweet = prerender(getTweetPropsSchema, async ({ id }) => {
	const tweet = await sveltweet.getTweet(id);
	if (tweet == null) {
		error(404, `Tweet not found: ${id}`);
	}
	backfillEntities(tweet as TweetLike);
	// eslint-disable-next-line no-console
	console.log('Fetched tweet:', id);
	return tweet;
});

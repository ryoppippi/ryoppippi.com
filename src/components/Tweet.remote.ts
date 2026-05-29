import { prerender } from '$app/server';
import { error } from '@sveltejs/kit';
import { type } from 'arktype';
import * as sveltweet from 'sveltweet/api';

const getTweetPropsSchema = type({
	id: 'string',
});

/**
 * Remote function to fetch a tweet
 * @see https://svelte.dev/docs/kit/remote-functions
 */
export const getTweet = prerender(getTweetPropsSchema, async ({ id }) => {
	const tweet = await sveltweet.getTweet(id);
	if (tweet == null) {
		error(404, `Tweet not found: ${id}`);
	}
	// The syndication API now omits empty entity arrays (hashtags / user_mentions / urls / symbols),
	// but sveltweet's enrichTweet iterates them unconditionally and throws "entities is not iterable".
	// Backfill missing arrays so rendering stays safe until sveltweet handles this upstream.
	tweet.entities = {
		...tweet.entities,
		hashtags: tweet.entities.hashtags ?? [],
		user_mentions: tweet.entities.user_mentions ?? [],
		urls: tweet.entities.urls ?? [],
		symbols: tweet.entities.symbols ?? [],
	};
	// eslint-disable-next-line no-console
	console.log('Fetched tweet:', id);
	return tweet;
});

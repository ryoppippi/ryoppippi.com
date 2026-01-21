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
	// eslint-disable-next-line no-console
	console.log('Fetched tweet:', id);
	return tweet;
});

import { prerender } from '$app/server';
import { error } from '@sveltejs/kit';
import { type } from 'arktype';
import * as sveltweet from 'sveltweet/api';

const getTweetPropsSchema = type({
	id: 'string',
});

/**
 * tweet を取得するRemote function
 * https://svelte.dev/docs/kit/remote-functions
 */
export const getTweet = prerender(getTweetPropsSchema, async ({ id }) => {
	const tweet = await sveltweet.getTweet(id);
	if (tweet == null) {
		error(404, `Tweet not found: ${id}`);
	}
	return tweet;
});

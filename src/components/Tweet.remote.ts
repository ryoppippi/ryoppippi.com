import { prerender } from '$app/server';
import { error } from '@sveltejs/kit';
import { type } from 'arktype';
import { ExponentialBackoff, fallback, handleAll, retry } from 'cockatiel';
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

type FetchedTweet = Awaited<ReturnType<typeof sveltweet.getTweet>>;

/**
 * Number of retries for the syndication API before falling back to the
 * react-tweet API.
 *
 * The Twitter syndication API intermittently rate-limits requests during
 * a full prerender build, so transient failures are retried a few times
 * with an exponential backoff.
 */
const SYNDICATION_RETRIES = 2;

/**
 * Stable fallback endpoint for fetching tweets.
 *
 * The syndication API is unstable under load; this endpoint returns the
 * same tweet payload wrapped as `{ data }`.
 * @see https://react-tweet.vercel.app
 */
const REACT_TWEET_API = 'https://react-tweet.vercel.app/api/tweet';

/**
 * Retry policy for the syndication API.
 *
 * Retries transient failures with an exponential backoff (500ms initial
 * delay), which usually outlasts the syndication API's intermittent rate
 * limiting during a full prerender build.
 */
const syndicationRetry = retry(handleAll, {
	maxAttempts: SYNDICATION_RETRIES,
	backoff: new ExponentialBackoff({ initialDelay: 500 }),
});

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
 * Fetch a tweet from the react-tweet API.
 *
 * Used as a fallback when the syndication API is unstable. Returns null
 * when the tweet cannot be retrieved.
 */
async function fetchTweetFromReactTweet(id: string): Promise<FetchedTweet | null> {
	const res = await fetch(`${REACT_TWEET_API}/${id}`);
	if (!res.ok) {
		return null;
	}
	const body = await res.json() as { data?: FetchedTweet };
	return body.data ?? null;
}

/**
 * Fetch a tweet resiliently.
 *
 * Retries the syndication API (via sveltweet) with a backoff, then falls
 * back to the react-tweet API when it stays unstable. sveltweet's
 * fetchTweet throws when the API returns a non-OK, non-404 response with a
 * non-JSON body (typically a rate limit hit while prerendering many
 * tweets). A clean undefined means the tweet is deleted/private, so it
 * resolves without retrying or falling back. Returns null when the tweet
 * cannot be fetched, so the caller can render a not-found state instead of
 * failing the build.
 */
async function fetchTweetResilient(id: string): Promise<FetchedTweet | null> {
	const fallbackToReactTweet = fallback<FetchedTweet | null>(handleAll, async () => {
		try {
			return await fetchTweetFromReactTweet(id);
		}
		catch (cause) {
			console.warn(`Failed to fetch tweet ${id}:`, cause);
			return null;
		}
	});

	return fallbackToReactTweet.execute(
		async () => syndicationRetry.execute(async () => await sveltweet.getTweet(id) ?? null),
	);
}

/**
 * Remote function to fetch a tweet
 * @see https://svelte.dev/docs/kit/remote-functions
 */
export const getTweet = prerender(getTweetPropsSchema, async ({ id }) => {
	const tweet = await fetchTweetResilient(id);
	if (tweet == null) {
		error(404, `Tweet not found: ${id}`);
	}
	backfillEntities(tweet as TweetLike);
	return tweet;
});

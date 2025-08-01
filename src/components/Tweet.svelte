<script lang='ts'>
	import { getTweet } from '$lib/tweet.remote.js';
	import * as st from 'sveltweet';

	type Props = Parameters<typeof getTweet>[0];

	const { id }: Props = $props();
	const tweet = getTweet({ id });
</script>

<!-- TODO: async using svelte:bundary -->
{#if tweet.error}
	<st.TweetNotFound />
{:else if tweet.loading || !tweet.ready}
	<st.TweetSkeleton />
{:else}
	<st.Tweet tweet={tweet.current} />
{/if}

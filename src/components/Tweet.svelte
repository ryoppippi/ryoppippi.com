<script lang='ts'>
	import { getTweet } from '$lib/tweet.remote.js';
	import * as st from 'sveltweet';

	type Props = Parameters<typeof getTweet>[0];

	const { id }: Props = $props();
</script>

<svelte:boundary>
	<st.Tweet tweet={await getTweet({ id })} />

	{#snippet pending()}
		<st.TweetSkeleton />
	{/snippet}

	{#snippet failed()}
		<st.TweetNotFound />
	{/snippet}
</svelte:boundary>

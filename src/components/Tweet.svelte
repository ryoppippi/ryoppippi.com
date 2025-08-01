<script lang='ts'>
	import { getTweet } from '$lib/tweet.remote.js';
	import { Tweet as Sveltweet } from 'sveltweet';

	type Props = Parameters<typeof getTweet>[0];

	const { id }: Props = $props();
	const tweet = getTweet({ id });
</script>

{#if tweet.ready}
	<Sveltweet tweet={tweet.current} />
{/if}

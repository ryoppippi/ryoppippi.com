<script lang='ts'>
	import { Tweet as Sveltweet } from 'sveltweet';
	import { getTweet } from './tweet.remote.js';

	type Props = Parameters<typeof getTweet>[0];

	const { id }: Props = $props();
	const tweet = getTweet({ id });
</script>

{#if tweet.ready}
	<Sveltweet tweet={tweet.current} />
{/if}

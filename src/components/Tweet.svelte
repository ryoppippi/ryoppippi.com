<script lang='ts'>
	import * as st from 'sveltweet';
	import { getTweet } from './Tweet.remote.js';

	type Props = Parameters<typeof getTweet>[0];

	const { id }: Props = $props();
</script>

<svelte:boundary>
	<st.Tweet tweet={await getTweet({ id })} />

	{#snippet failed()}
		<st.TweetNotFound />
	{/snippet}
</svelte:boundary>

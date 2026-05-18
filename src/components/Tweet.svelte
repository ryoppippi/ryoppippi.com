<script lang='ts'>
	import * as st from 'sveltweet';
	import { getTweet } from './Tweet.remote.js';

	type Props = Parameters<typeof getTweet>[0];

	const { id }: Props = $props();
</script>

<svelte:boundary>
	<st.Tweet tweet={await getTweet({ id })} />

	{#snippet failed()}
		<a href='https://x.com/i/web/status/{id}' rel='noopener noreferrer' target='_blank'>Tweet {id}</a>
	{/snippet}
</svelte:boundary>

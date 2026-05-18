<script lang='ts'>
	import * as st from 'sveltweet';
	import { getTweet } from './Tweet.remote.js';

	type Props = Parameters<typeof getTweet>[0];

	const { id }: Props = $props();
</script>

<svelte:boundary>
	{#await getTweet({ id }) then tweet}
		<st.Tweet {tweet} />
	{/await}

	{#snippet failed()}
		<a href='https://x.com/i/web/status/{id}' rel='noopener noreferrer' target='_blank'>Tweet {id}</a>
	{/snippet}
</svelte:boundary>

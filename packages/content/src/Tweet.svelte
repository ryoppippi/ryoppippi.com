<script lang='ts'>
	import type { getTweet } from 'sveltweet/api';
	import * as SvelteTweet from 'sveltweet';

	type TweetData = NonNullable<Awaited<ReturnType<typeof getTweet>>>;

	let { id, tweet }: { id: string; tweet?: TweetData } = $props();
</script>

{#if tweet != null}
	<SvelteTweet.Tweet {tweet} />
{:else}
	<a href={`https://x.com/i/web/status/${id}`} rel='noopener noreferrer' target='_blank'>
		https://x.com/i/web/status/{id}
	</a>
{/if}

<script lang='ts'>
	import type { Tweet } from 'sveltweet/api';
	import * as st from 'sveltweet';

	type Props = {
		id: string;
	};

	const { id }: Props = $props();
	const tweet = fetch(`https://react-tweet.vercel.app/api/tweet/${id}`).then(async res => (await res.json()) as { data: Tweet | null }).then(res => res.data);
</script>

{#await tweet}
	<st.TweetSkeleton />
{:then data}
	{#if data}
		<st.Tweet tweet={data} />
	{:else}
		<st.TweetNotFound />
	{/if}
{:catch _error}
	<st.TweetNotFound />
{/await}

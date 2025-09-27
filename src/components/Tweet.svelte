<script lang='ts'>
	import { getTweet } from '$lib/tweet.remote.js';
	import * as st from 'sveltweet';

	type Props = Parameters<typeof getTweet>[0];

	const { id }: Props = $props();
</script>

<st.Tweet tweet={await getTweet({ id })} />

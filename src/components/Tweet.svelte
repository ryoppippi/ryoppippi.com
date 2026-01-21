<script lang='ts'>
	import * as st from 'sveltweet';
	import { getTweet } from './Tweet.remote.js';

	type Props = Parameters<typeof getTweet>[0];

	const { id }: Props = $props();
</script>

<st.Tweet tweet={await getTweet({ id })} />

<script lang='ts'>
	import { hydratable } from 'svelte';
	import * as st from 'sveltweet';
	import * as stApi from 'sveltweet/api';

	type Props = {
		id: string;
	};

	const { id }: Props = $props();

	const tweet = await hydratable(`tweet-${id}`, async () => {
		return stApi.getTweet(id);
	});
</script>

<st.Tweet {tweet} />

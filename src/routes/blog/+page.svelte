<script lang='ts'>
	import * as ufo from 'ufo';
	import HeadTitle from '$lib/HeadTitle.svelte';
	import { formatDate } from '$lib/util';
	import ListView, { type Item } from '$lib/ListView.svelte';

	const { data } = $props();

	const items = data.posts.map((item) => {
		const pubDate = formatDate(new Date(item.pubDate));
		const link = 'link' in item ? item.link : ufo.joinURL('/blog', item.slug);
		const external = 'link' in item && item.link.startsWith('http');
		return {
			...item,
			date: pubDate,
			link,
			external,
		};
	}) satisfies Item[];
</script>

<HeadTitle title='blog' />

{#snippet itemView(item: Item)}
	{#if item.external}
		{#if item.link.includes('zenn')}
			<!-- svelte-ignore element_invalid_self_closing_tag -->
			<span
				blog-list-icon
				i-simple-icons-zenn
				text='group-hover:[#3EA8FF]'
			/>
		{:else}
			<!-- svelte-ignore element_invalid_self_closing_tag -->
			<span blog-list-icon i-quill-link-out />
		{/if}
	{:else}
		<!-- svelte-ignore element_invalid_self_closing_tag -->
		<span blog-list-icon i-simple-icons-markdown />
	{/if}
	<p truncate>{item.title}</p>
{/snippet}

<ListView
	{itemView}
	{items}
/>

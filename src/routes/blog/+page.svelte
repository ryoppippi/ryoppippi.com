<script lang='ts'>
	import HeadTitle from '$lib/HeadTitle.svelte';
	import ListView, { type Item } from '$lib/ListView.svelte';

	const { data } = $props();

	let isOnlyEnglish = $state(false);
	let isOnlyEnglishChangedCount = $state(0);

	const items = $derived(data.posts.filter(i => !isOnlyEnglish || i.lang === 'en'));
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

<div mxa px-10>
	<button
		fyc
		gap-1
		mb2
		onclick={() => {
			isOnlyEnglish = !isOnlyEnglish;
			isOnlyEnglishChangedCount += 1;
		}}
		op30
		text-sm
		type='button'>
		<!-- svelte-ignore element_invalid_self_closing_tag -->
		<div
			class:i-carbon-checkbox={!isOnlyEnglish}
			class:i-carbon-checkbox-checked={isOnlyEnglish}
		/>
		English Only
	</button>
</div>

<ListView
	animation={isOnlyEnglishChangedCount < 1}
	{itemView}
	{items}
/>

<script lang='ts'>
	import CheckButton from './CheckButton.svelte';
	import HeadTitle from '$lib/HeadTitle.svelte';
	import ListView, { type Item } from '$lib/ListView.svelte';

	const { data } = $props();

	let isOnlyEnglishCount = $state(0);
	const isOnlyEnglish = $derived(isOnlyEnglishCount % 2 === 1);

	let isOnlyRyoppippiCount = $state(0);
	const isOnlyRyoppippi = $derived(isOnlyRyoppippiCount % 2 === 1);

	const items = $derived(data
		.posts
		.filter(i => !isOnlyEnglish || i.lang === 'en')
		.filter(i => !isOnlyRyoppippi || !i.link.startsWith('http')),
	);
</script>

<HeadTitle title='blog' />

{#snippet itemView(item: Item)}
	<div fyc gap-1 op-card>
		{#if item.external}
			{#if item.link.includes('zenn')}
				<!-- svelte-ignore element_invalid_self_closing_tag -->
				<div
					blog-list-icon
					i-simple-icons-zenn
					text='group-hover:[#3EA8FF]'
				/>
			{:else}
				<!-- svelte-ignore element_invalid_self_closing_tag -->
				<div blog-list-icon i-quill-link-out />
			{/if}
		{:else}
			<!-- svelte-ignore element_invalid_self_closing_tag -->
			<span blog-list-icon i-simple-icons-markdown />
		{/if}
		<p
			style:view-transition-name='blog-{item.slug}'
			truncate
		>
			{item.title}
		</p>
	</div>
{/snippet}

<div mxa px-10>
	<CheckButton
		iconClass={!isOnlyEnglish ? 'i-carbon-checkbox' : 'i-carbon-checkbox-checked'}
		onclick={() => isOnlyEnglishCount++}
		text='English Only'
	/>
	<CheckButton
		iconClass={!isOnlyRyoppippi ? 'i-carbon-checkbox' : 'i-carbon-checkbox-checked'}
		onclick={() => isOnlyRyoppippiCount++}
		text='ryoppippi.com exclusive'
	/>
</div>

<ListView
	animation={isOnlyEnglishCount < 1}
	{itemView}
	{items}
/>

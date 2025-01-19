<script lang='ts'>
	import type { Item } from '$components/ListView.svelte';

	const { data } = $props();

	let isOnlyEnglish = $state(false);

	let isOnlyRyoppippi = $state(false);

	const items = $derived(data
		.posts
		.filter(i => !isOnlyEnglish || i.lang === 'en')
		.filter(i => !isOnlyRyoppippi || !i.link.startsWith('http')),
	);

	export const snapshot = {
		capture: () => ({ isOnlyEnglish, isOnlyRyoppippi }),
		restore: (value) => {
			isOnlyEnglish = value.isOnlyEnglish;
			isOnlyRyoppippi = value.isOnlyRyoppippi;
		},
	};
</script>

{#snippet itemView(_item: Item)}
	{@const item = _item as typeof data.posts[0]}
	<div flex gap-2 items-start my-2>
		<span mt-0.5>
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
				<div blog-list-icon i-simple-icons-markdown />
			{/if}
		</span>
		<p
			style:view-transition-name='blog-{item.slug}'
			gap-x-2
		>
			{#if 'isPublished' in item && !item?.isPublished}<span bg-red>(draft)</span>{/if}
			{item.title}
			<span op50 pl-2 text-sm truncate>{item.date}</span>
		</p>

	</div>
{/snippet}

<div mxa pt-10 px-10>
	<CheckButton
		iconClass={!isOnlyEnglish ? 'i-carbon-checkbox' : 'i-carbon-checkbox-checked'}
		onclick={() => isOnlyEnglish = !isOnlyEnglish}
		text='English Only'
	/>
	<CheckButton
		iconClass={!isOnlyRyoppippi ? 'i-carbon-checkbox' : 'i-carbon-checkbox-checked'}
		onclick={() => isOnlyRyoppippi = !isOnlyRyoppippi}
		text='ryoppippi.com exclusive'
	/>
</div>

<ListView
	{itemView}
	{items}
/>

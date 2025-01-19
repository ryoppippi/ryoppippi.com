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
			<!-- svelte-ignore element_invalid_self_closing_tag -->
			<div
				class={[
					'blog-list-icon',
					{
						'i-simple-icons-markdown': !item.external,
						'i-simple-icons-zenn group-hover:text-#3EA8FF': item.link.includes('zenn'),
						'i-quill-link-out': item.external, // default for external links
					},
				]}
			/>
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
		checked={isOnlyEnglish}
		onclick={() => isOnlyEnglish = !isOnlyEnglish}
		text='English Only'
	/>
	<CheckButton
		checked={isOnlyRyoppippi}
		onclick={() => isOnlyRyoppippi = !isOnlyRyoppippi}
		text='ryoppippi.com exclusive'
	/>
</div>

<ListView
	{itemView}
	{items}
/>

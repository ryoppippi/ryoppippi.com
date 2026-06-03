<script lang='ts'>
	import type { Item } from '$components/ListView.svelte';
	import CheckButton from '$components/CheckButton.svelte';
	import Icon from '$components/Icon.svelte';
	import ListView from '$components/ListView.svelte';
	import './page.css';

	const { data } = $props();

	let isOnlyEnglish = $state(false);

	let isOnlyRyoppippi = $state(false);

	export const snapshot = {
		capture: () => ({ isOnlyEnglish, isOnlyRyoppippi }),
		restore: (value) => {
			isOnlyEnglish = value.isOnlyEnglish;
			isOnlyRyoppippi = value.isOnlyRyoppippi;
		},
	};
</script>

<h1 class='sr-only'>Blog</h1>

{#snippet itemView(_item: Item)}
	{@const item = _item as typeof data.posts[0]}
	{@const filterByEnglish = !(isOnlyEnglish && item.lang !== 'en')}
	{@const filterByRyoppippi = !(isOnlyRyoppippi && item.link.includes('http'))}
	{#if filterByEnglish && filterByRyoppippi}
		<div class='my-2 flex items-start gap-2'>
			<span class='mt-0.5'>
				{#if item.external}
					<Icon class='icon-[quill--link-out] blog-list-icon' aria-hidden='true' />
				{:else}
					<Icon class='icon-[simple-icons--markdown] blog-list-icon' aria-hidden='true' />
				{/if}
			</span>
			<p
				style:view-transition-name='blog-{item.slug}'
				class='gap-x-2'
			>
				{#if 'isPublished' in item && !item?.isPublished}<span class='bg-red-500'>(draft)</span>{/if}
				{item.title}
				<span class='truncate pl-2 text-sm opacity-50'>{item.date}</span>
			</p>
		</div>
	{/if}
{/snippet}

<div class='fcol mx-auto gap-1 px-10 pt-10'>
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
	items={data.posts}
/>

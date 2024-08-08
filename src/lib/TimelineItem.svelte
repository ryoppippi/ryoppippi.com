 <script lang='ts'>
	import type { Snippet } from 'svelte';

	const {
		icon,
		title = '',
		date,
		hidden = false,
		titleSlot,
		mainSlot,
		otherSlot,
	}: {
		icon: string;
		title?: string;
		date: string;
		hidden?: boolean;
		titleSlot?: Snippet;
		mainSlot?: Snippet;
		otherSlot?: Snippet;
	} = $props();
</script>

<li class='mb-10 ml-6 transition-opacity' class:opacity-20={hidden}>
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<span class='flex h-6 w-6 items-center justify-center rounded-full bg-me-primary-200 ring-8 ring-gray-900 md:absolute md:-left-3'>
		<div class={icon} />
	</span>

	<h3 class='mb-1 flex items-center text-lg font-semibold text-me-text-100'>
		{title}
		{#if titleSlot != null}
			{@render titleSlot()}
		{/if}
	</h3>

	<time class='mb-2 block text-sm font-normal leading-none text-me-text-200'>
		{date}
	</time>

	{#if mainSlot != null}
		<p class='mb-4 text-base font-normal text-gray-500'>
			{@render mainSlot()}
		</p>
	{/if}

	{#if otherSlot != null}
		{@render otherSlot()}
	{/if}
</li>

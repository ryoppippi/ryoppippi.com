<script context='module' lang='ts'>
	export type Item = {
		title: string;
		link: string;
		date?: string;
		lang?: string;
		external?: boolean;
	};
</script>

<script lang='ts'>
	import type { Snippet } from 'svelte';
	import { slugify } from '$lib/util';

	type Props = {
		items: Item[];
		itemView: Snippet<[Item]>;
		animation?: boolean;
		isEnglishOnly?: boolean;
	};

	const {
		items,
		itemView,
		animation,
		isEnglishOnly = $bindable(false),
	}: Props = $props();
</script>
<div mxa px-10>
	{#each items as item, count (slugify(item.title))}
		{@const external = item.link.startsWith('http')}
		<div
			style:--stagger={count}
			class:hidden={isEnglishOnly && item.lang !== 'en'}
			class:sliding-animation={animation}
			my-2
			sliding-animation-delay-base
			transition-all
		>
			{#if item.date}
				<p opacity-70>
					{item.date}
				</p>
			{/if}
			<a
				class='group'
				border='b-2 transparent hover:primary-100'
				fyc
				gap-3
				href={item.link}
				mr-5
				target={external ? '_blank' : ''}
			>
				{@render itemView(item)}
			</a>
		</div>
	{/each}
</div>

<style>
a {
	--at-apply: hover:no-underline;
}
</style>

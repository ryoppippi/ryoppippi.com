<script context='module' lang='ts'>
	export type Item = {
		title: string;
		link: string;
		date: string;
		external?: boolean;
	};
</script>

<script lang='ts'>
	import type { Snippet } from 'svelte';

	type Props<_Item extends Item = Item> = {
		items: Item[];
		itemView: Snippet<[_Item]>;
	};

	const { items, itemView }: Props = $props();
</script>
<div mxa px-10>
	{#each items as item, count (item.title)}
		{@const external = item.link.startsWith('http')}
		<div
			style:--stagger={count}
			class='[--delay:80ms] sm:[--delay:150ms]'
			data-sliding-animate
			my-2
		>
			<p opacity-70>
				{item.date}}
			</p>
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

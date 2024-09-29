<script context='module' lang='ts'>
	export type Item = {
		title: string;
		link: string;
		date?: string;
		external?: boolean;
	};
</script>

<script lang='ts'>
	import type { Snippet } from 'svelte';

	type Props = {
		items: Item[];
		itemView: Snippet<[Item]>;
		animation?: boolean;
	};

	const { items, itemView, animation }: Props = $props();
</script>
<div mxa px-10>
	{#each items as item, count (item.title)}
		{@const external = item.link.startsWith('http')}
		<div
			style:--stagger={count}
			class:animate-delay-base={animation}
			my-2
			sliding-animation='~ delay-base'
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

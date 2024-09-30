<script context='module' lang='ts'>
	export type Item = {
		title: string;
		link: string;
		date?: string;
		slug: string;
		lang?: string;
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

	const {
		items,
		itemView,
		animation,
	}: Props = $props();
</script>
<div mxa px-10>
	{#each items as item, count (item.slug)}
		{@const external = item.link.startsWith('http')}
		<div
			style:--stagger={count}
			style:--start='300ms'
			class:sliding-animation={animation}
			my-2
			sliding-animation-delay-base
		>
			{#if item.date}
				<p opacity-70>
					{item.date}
				</p>
			{/if}
			<a
				class='group'
				fyc
				gap-3
				href={item.link}
				mr-5
				op-card
				target={external ? '_blank' : ''}
				transition-base
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

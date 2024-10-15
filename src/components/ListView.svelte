<script context='module' lang='ts'>
	export type Item = {
		title: string;
		link?: string;
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
		{@const external = typeof item.link === 'string' && item?.link.startsWith('http')}
		<div
			style:--stagger={count}
			style:--start='300ms'
			class:sliding-animation={animation}
			my-2
			sliding-animation-delay-base
		>
			<svelte:element
				this={item.link != null ? 'a' : 'div'}
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
			</svelte:element>
		</div>
	{/each}
</div>

<style>
a {
	--at-apply: hover:no-underline;
}
</style>

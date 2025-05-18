<script lang='ts' module>
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
	};

	const {
		items,
		itemView,
	}: Props = $props();
</script>
<div mxa px-10>
	{#each items as item (item.slug)}
		{@const external = typeof item.link === 'string' && item?.link.startsWith('http')}
		<div my-2>
			{#if item.link != null}
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
			{:else}
				<div class='group' fyc gap-3 mr-5 op-card transition-base>
					{@render itemView(item)}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
a {
	--uno: hover:no-underline;
}
</style>

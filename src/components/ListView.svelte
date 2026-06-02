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
<div class='mx-auto px-10'>
	{#each items as item (item.slug)}
		{@const external = typeof item.link === 'string' && item?.link.startsWith('http')}
		<div class='my-2'>
			{#if item.link != null}
				<a
					class='group fyc gap-3 mr-5 op-card transition-base hover:no-underline'
					href={item.link}
					rel={external ? 'noopener noreferrer' : undefined}
					target={external ? '_blank' : undefined}
				>
					{@render itemView(item)}
				</a>
			{:else}
				<div class='group fyc gap-3 mr-5 op-card transition-base'>
					{@render itemView(item)}
				</div>
			{/if}
		</div>
	{/each}
</div>

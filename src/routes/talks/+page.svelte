<script lang='ts'>
	import { type Item as ListItem } from '$components/ListView.svelte';

	const { data } = $props();
	const { talks } = data;

	type Talk = typeof talks[string][0];

	$inspect({ talks });
</script>

{#snippet itemView(_item: ListItem)}
	{@const item = _item as unknown as Talk}
	<div>
		<h3 text-xl>{item.title}</h3>
		<p op50>
			{item.event}
			<span op80 pl-2 text-sm truncate>{item.date}</span>
		</p>
	</div>
{/snippet}

{#each Object.entries(talks).sort(([a], [b]) => Number(b) - Number(a)) as [year, items], count (year)}
	<LargeTitle title={year} />

	<div
		style:--stagger={count}
		animate-delay-base
		no-underline
		sliding-animation='~ delay-base'
	>
		<ListView
			animation={false}
			{itemView}
			items={items as unknown as ListItem[]}
		/>
	</div>
{/each}

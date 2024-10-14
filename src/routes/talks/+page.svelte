<script lang='ts'>
	import { type Item as ListItem } from '$components/ListView.svelte';

	const { data } = $props();
	const { talks } = data;

	type Talk = typeof talks[string][0];

	$inspect({ talks });
</script>

{#snippet itemView(_item: ListItem)}
	{@const item = _item as unknown as Talk}
	<div mt-5>
		<h3 text-xl><a href={item.urls.at(0)}>{item.title}</a></h3>
		<p op50>
			<a href={item.eventLink}>{item.event}</a>
			<span op80 pl-2 text-sm truncate>{item.date}</span>
		</p>
		{#if item.videoLink}
			<p op50>
				<a href={item.videoLink}>Watch the video</a>
			</p>
		{/if}
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

<style>
a {
	--at-apply: hover:underline;
}
</style>

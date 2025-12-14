<script lang='ts'>
	import type { Item as ListItem } from '$components/ListView.svelte';
	import LargeTitle from '$components/LargeTitle.svelte';
	import ListView from '$components/ListView.svelte';
	import publications from '$contents/publication.json';

	interface Item {
		title: string;
		link: string;
		authors: string;
		publisher: string;
	}

</script>

{#snippet itemView(_item: ListItem)}
	{@const item = _item as unknown as Item}
	<div mt-5>
		<h3 text-xl>{item.title}</h3>
		<p op50>{item.publisher}</p>
	</div>
{/snippet}

{#each Object.entries(publications).sort(([a], [b]) => Number(b) - Number(a)) as [year, _items] (year)}
	{@const items = _items.map(item => ({ ...item, slug: JSON.stringify(item) }))}
	<div
		animate-delay-base
		no-underline
	>
		<LargeTitle title={year} />
		<ListView
			{itemView}
			{items}
		/>
	</div>
{/each}

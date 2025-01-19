<script lang='ts'>
	import { type Item as ListItem } from '$components/ListView.svelte';

	type Year = `${number}`;
	interface Item {
		title: string;
		link: string;
		authors: string;
		publisher: string;
	}

	const publications = {
		2019: [
			{
				title: `Artificial Neural Networks for Realized Volatility Prediction in Cryptocurrency Time Series`,
				link: `https://link.springer.com/chapter/10.1007/978-3-030-22796-8_18`,
				authors: `<span text-bold>Ryotaro Miura</span>, Lukáš Pichl, Taisei Kaizoji`,
				publisher: `ISNN 2019: Advances in Neural Networks 2019`,
			},
			{
				title: `An Intuitive Interface for Digital Synthesizer by Pseudo-intention Learning`,
				link: `https://dl.acm.org/doi/10.1145/3356590.3356598`,
				authors: `Keisuke Shiro, Ryotaro Miura, Changyo Han and Jun Rekimoto`,
				publisher: `Audio Mostly 2019`,
			},
		],
		2022: [
			{
				title: `Prometheus: A mobile telepresence system connecting the 1st person and 3rd person perspectives continuously`,
				link: `https://dl.acm.org/doi/10.1145/3550082.3564187`,
				authors: `Ryotaro Kimura, Jun Rekimoto`,
				publisher: `SIGGRAPH Asia 2022 `,
			},
		],
	} as const satisfies Record<Year, Item[]>;
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

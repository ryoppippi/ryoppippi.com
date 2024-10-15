<script lang='ts'>
	import { type Item as ListItem } from '$components/ListView.svelte';

	const { data } = $props();
	const { talks } = data;

	type Talk = typeof talks[string][0];

	let isOnlyEnglish = $state(false);

	export const snapshot = {
		capture: () => ({ isOnlyEnglish }),
		restore: (value) => {
			isOnlyEnglish = value.isOnlyEnglish;
		},
	};
</script>

{#snippet itemView(_item: ListItem)}
	{@const item = _item as unknown as Talk}
	{#if !(isOnlyEnglish && item.lang !== 'en')}
		<div mt-5>
			<h3 text-xl><a href={item.links.at(0)}>{item.title}</a></h3>
			<p op50>
				<a href={item.eventLink}>{item.event}</a>
				<span op80 pl-2 text-sm truncate>{item.date}</span>
			</p>
			{#if item.videoLink}
				<p op50 text-sm>
					<a href={item.videoLink}>Watch the video</a>
				</p>
			{/if}
		</div>
	{/if}
{/snippet}

<div mxa pt-10>
	<CheckButton
		iconClass={!isOnlyEnglish ? 'i-carbon-checkbox' : 'i-carbon-checkbox-checked'}
		onclick={() => isOnlyEnglish = !isOnlyEnglish}
		text='English Only'
	/>
</div>

{#each Object.entries(talks).sort(([a], [b]) => Number(b) - Number(a)) as [year, items], count (year)}
	<div
		style:--stagger={count}
		animate-delay-base
		no-underline
		sliding-animation='~ delay-base'
	>
		<LargeTitle title={year} />
		<ListView
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

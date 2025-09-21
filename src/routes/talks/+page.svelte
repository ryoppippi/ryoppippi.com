<script lang='ts'>
	import type { Item as ListItem } from '$components/ListView.svelte';
	import CheckButton from '$components/CheckButton.svelte';
	import LargeTitle from '$components/LargeTitle.svelte';
	import ListView from '$components/ListView.svelte';

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

{#snippet link(_link: string | null | undefined, _text: string)}
	<a
		class={_link == null ? 'no-underline' : 'underline'}
		href={_link}
		target='_blank'
	>
		{_text}
	</a>
{/snippet}

{#snippet itemView(_item: ListItem)}
	{@const item = _item as unknown as Talk}
	{@const _link = item.links.at(0)}
	{#if !(isOnlyEnglish && item.lang !== 'en')}
		<div mt-5>
			<h3 text-xl>
				{@render link(_link, item.title)}
			</h3>
			<p op50>
				{@render link(item.eventLink, item.event)}
				<span op80 pl-2 text-sm truncate>{item.date}</span>
			</p>
			{#if item.videoLink}
				<p op50 text-sm>
					{@render link(item.videoLink, 'Watch the video')}
				</p>
			{/if}
		</div>
	{/if}
{/snippet}

<div fcol gap-1 mxa pt-10>
	<a
		fyc
		gap-1
		href='https://talks.ryoppippi.com/feed.xml'
		mya
		op30
		target='_blank'
	>
		<!-- svelte-ignore element_invalid_self_closing_tag -->
		<span class='i-line-md:rss' />
		Feed
	</a>
	<CheckButton
		checked={isOnlyEnglish}
		onclick={() => isOnlyEnglish = !isOnlyEnglish}
		text='English Only'
	/>
</div>

{#each Object.entries(talks).sort(([a], [b]) => Number(b) - Number(a)) as [year, items] (year)}
	<div
		animate-delay-base
		no-underline
	>
		<LargeTitle title={year} />
		<ListView
			{itemView}
			items={items as unknown as ListItem[]}
		/>
	</div>
{/each}

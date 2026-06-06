<script lang='ts'>
	import type { Item as ListItem } from '$components/ListView.svelte';
	import CheckButton from '$components/CheckButton.svelte';
	import Icon from '$components/Icon.svelte';
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
	{#if _link == null}
		<span>{_text}</span>
	{:else}
		<a
			class='underline'
			href={_link}
			rel='noopener noreferrer'
			target='_blank'
		>
			{_text}
		</a>
	{/if}
{/snippet}

{#snippet itemView(_item: ListItem)}
	{@const item = _item as unknown as Talk}
	{@const _link = item.links.at(0)}
	{#if !(isOnlyEnglish && item.lang !== 'en')}
		<div class='mt-5'>
			<h3 class='text-xl'>
				{@render link(_link, item.title)}
			</h3>
			<p class='opacity-50'>
				{@render link(item.eventLink, item.event)}
				<span class='truncate pl-2 text-sm opacity-80'>{item.date}</span>
			</p>
			{#if item.videoLink}
				<p class='text-sm opacity-50'>
					{@render link(item.videoLink, 'Watch the video')}
				</p>
			{/if}
		</div>
	{/if}
{/snippet}

<div class='fcol mx-auto gap-1 pt-10'>
	<a
		class='fyc my-auto gap-1 opacity-30'
		href='https://talks.ryoppippi.com/feed.xml'
		rel='noopener noreferrer'
		target='_blank'
	>
		<Icon class='icon-[line-md--rss]' aria-hidden='true' />
		Feed
	</a>
	<a
		class='fyc my-auto gap-1 opacity-30'
		href='/yt-talks'
		rel='noopener noreferrer'
		target='_blank'
	>
		<Icon class='icon-[ri--youtube-line]' aria-hidden='true' />
		Watch all talks on YouTube
	</a>
	<CheckButton
		checked={isOnlyEnglish}
		onclick={() => isOnlyEnglish = !isOnlyEnglish}
		text='English Only'
	/>
</div>

{#each Object.entries(talks).sort(([a], [b]) => Number(b) - Number(a)) as [year, items] (year)}
	<div class='no-underline'
	>
		<LargeTitle level={2} title={year} />
		<ListView
			{itemView}
			items={items as unknown as ListItem[]}
		/>
	</div>
{/each}

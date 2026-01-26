<script lang='ts'>
	import type { Item as ListItem } from '$components/ListView.svelte';
	import CheckButton from '$components/CheckButton.svelte';
	import LargeTitle from '$components/LargeTitle.svelte';
	import ListView from '$components/ListView.svelte';
	import publications from '$contents/publication.json';

	interface Item {
		title: string;
		link: string;
		authors: string;
		publisher: string;
	}

	let isOnlyEnglish = $state(false);

	export const snapshot = {
		capture: () => ({ isOnlyEnglish }),
		restore: (value) => {
			isOnlyEnglish = value.isOnlyEnglish;
		},
	};

	/**
	 * Extract English title from parentheses if exists
	 * e.g. "日本語タイトル (English Title)" -> { ja: "日本語タイトル", en: "English Title" }
	 */
	function parseTitle(title: string): { ja: string; en: string | null } {
		const lastOpenParen = title.lastIndexOf(' (');
		if (lastOpenParen > 0 && title.endsWith(')')) {
			const ja = title.slice(0, lastOpenParen);
			const en = title.slice(lastOpenParen + 2, -1);
			return { ja, en };
		}
		return { ja: title, en: null };
	}
</script>

{#snippet itemView(_item: ListItem)}
	{@const item = _item as unknown as Item}
	{@const { ja, en } = parseTitle(item.title)}
	{@const displayTitle = isOnlyEnglish && en ? en : (en ? `${ja} (${en})` : ja)}
	<div mt-5>
		<h3 text-xl>
			<a class='underline' href={item.link} target='_blank'>{displayTitle}</a>
		</h3>
		<p op50>{item.publisher}</p>
	</div>
{/snippet}

<div fcol gap-1 mxa pt-10>
	<CheckButton
		checked={isOnlyEnglish}
		onclick={() => isOnlyEnglish = !isOnlyEnglish}
		text='English Only'
	/>
</div>

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

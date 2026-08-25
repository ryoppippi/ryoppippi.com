<script lang='ts'>
	import type { PostListItem } from '../content.ts';
	import { formatDate } from '../../lib/util.ts';
	import WorksNav from './WorksNav.svelte';

	let { items }: { items: PostListItem[] } = $props();
	const kindDetails = {
		article: { label: 'Article', icon: 'icon-[quill--link-out]' },
		podcast: { label: 'Podcast', icon: 'icon-[ri--mic-line]' },
		video: { label: 'YouTube', icon: 'icon-[ri--youtube-line]' },
	} as const;
	const playlist = $derived(items.find((item) => item.playlist === true));
	const mediaItems = $derived(items.filter((item) => item.playlist !== true));
	const byYear = $derived(
		[...Map.groupBy(mediaItems, (item) => new Date(item.pubDate).getFullYear()).entries()].sort(
			([a], [b]) => b - a,
		),
	);
</script>

<WorksNav active='media' />

<div class='fcol mx-auto gap-1 pt-10'>
	<a class='fyc my-auto gap-1 opacity-30' href='/works/media/feed.xml' rel='alternate' target='_blank' type='application/rss+xml'>
		<span class='icon-[line-md--rss]' aria-hidden='true'></span>Feed
	</a>
	{#if playlist != null}
		<a class='fyc my-auto gap-1 opacity-30' href={playlist.link} rel='noopener noreferrer' target='_blank'>
			<span class='icon-[ri--youtube-line]' aria-hidden='true'></span>Watch all videos on YouTube
		</a>
	{/if}
	<button class='fyc gap-1 text-sm opacity-30' aria-pressed='false' data-media-filter='english' type='button'>
		<span class='icon-[carbon--checkbox]' aria-hidden='true'></span>English Only
	</button>
</div>

{#each byYear as [year, yearItems] (year)}
	<section data-media-year>
		<h2 class='f-text-32-64 my-8 font-mono font-bold leading-none text-stroke-aaa text-transparent opacity-35 dark:opacity-20'>{year}</h2>
		<ul class='mx-auto px-10'>
			{#each yearItems as item (item.slug)}
				{@const kind = item.kind ?? 'podcast'}
				{@const details = kindDetails[kind]}
				<li class='media-item my-5' data-lang={item.lang ?? 'ja'}>
					<h3 class='op-card text-xl transition-base'>
						<a class='underline' href={item.link} rel='noopener noreferrer' target='_blank'>{item.title}</a>
					</h3>
					<p class='opacity-50'>
						<span class={`${details.icon} mr-1`} aria-hidden='true'></span>{details.label}
						<time class='truncate pl-2 text-sm opacity-80' datetime={item.pubDate}>{formatDate(new Date(item.pubDate))}</time>
					</p>
				</li>
			{/each}
		</ul>
	</section>
{/each}

<script lang='ts'>
	import type { Talk } from '../sections.ts';
	import WorksNav from './WorksNav.svelte';

	let { talks }: { talks: Talk[] } = $props();
	const byYear = $derived([...Map.groupBy(talks, talk => new Date(talk.date).getFullYear()).entries()]
		.sort(([a], [b]) => b - a));
</script>

<WorksNav active='talks' />

<div class='fcol mx-auto gap-1 pt-10'>
	<a class='fyc my-auto gap-1 opacity-30' href='https://talks.ryoppippi.com/feed.xml' rel='noopener noreferrer' target='_blank'>
		<span class='icon-[line-md--rss]' aria-hidden='true'></span>Feed
	</a>
	<a class='fyc my-auto gap-1 opacity-30' href='/yt-talks' rel='noopener noreferrer' target='_blank'>
		<span class='icon-[ri--youtube-line]' aria-hidden='true'></span>Watch all talks on YouTube
	</a>
	<button class='fyc gap-1 text-sm opacity-30' aria-pressed='false' data-talk-filter='english' type='button'>
		<span class='icon-[carbon--checkbox]' aria-hidden='true'></span>English Only
	</button>
</div>

{#each byYear as [year, items] (year)}
	<section data-talk-year>
		<h2 class='f-text-32-64 my-8 font-mono font-bold leading-none text-stroke-aaa text-transparent opacity-35 dark:opacity-20'>{year}</h2>
		<ul class='mx-auto px-10'>
			{#each items as talk (`${talk.date}-${talk.title}`)}
				{@const link = talk.links.at(0)}
				<li class='talk-item my-5' data-lang={talk.lang ?? 'en'}>
					<h3 class='text-xl'>
						{#if link == null}
							{talk.title}
						{:else}
							<a class='underline' href={link} rel='noopener noreferrer' target='_blank'>{talk.title}</a>
						{/if}
					</h3>
					<p class='opacity-50'>
						{#if talk.eventLink == null}
							{talk.event}
						{:else}
							<a class='underline' href={talk.eventLink} rel='noopener noreferrer' target='_blank'>{talk.event}</a>
						{/if}
						<span class='truncate pl-2 text-sm opacity-80'>{talk.date}</span>
					</p>
					{#if talk.videoLink != null}
						<p class='text-sm opacity-50'><a class='underline' href={talk.videoLink} rel='noopener noreferrer' target='_blank'>Watch the video</a></p>
					{/if}
				</li>
			{/each}
		</ul>
	</section>
{/each}

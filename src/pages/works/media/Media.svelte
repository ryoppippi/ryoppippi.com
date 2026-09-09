<script lang="ts">
	import { formatDate } from '@/lib/date.ts';

	import type { PostListItem } from '@/lib/post-list.ts';

	import WorksNav from '@/components/WorksNav/index.svelte';

	import WorksSection from '@/components/WorksSection/index.svelte';
	import WorksList from '@/components/WorksSection/WorksList.svelte';

	type MediaProps = {
		items: PostListItem[];
	};

	const kindDetails = {
		article: { label: 'Article', icon: 'icon-[quill--link-out]' },
		podcast: { label: 'Podcast', icon: 'icon-[ri--mic-line]' },
		video: { label: 'YouTube', icon: 'icon-[ri--youtube-line]' },
	} as const;

	let { items }: MediaProps = $props();

	const playlist = $derived(items.find((item) => item.playlist === true));

	const mediaItems = $derived(items.filter((item) => item.playlist !== true));

	const byYear = $derived(
		[...Map.groupBy(mediaItems, (item) => new Date(item.pubDate).getFullYear()).entries()].sort(
			([a], [b]) => b - a,
		),
	);
</script>

<WorksNav active="media"></WorksNav>
<div class="mediaControls">
	<a
		class="mediaControlLink"
		href="/works/media/feed.xml"
		rel="alternate"
		target="_blank"
		type="application/rss+xml"><span class="icon-[line-md--rss]" aria-hidden="true"></span>Feed</a
	>{#if playlist != null}<a
			class="mediaControlLink"
			href={playlist.link}
			rel="noopener noreferrer"
			target="_blank"
			><span class="icon-[ri--youtube-line]" aria-hidden="true"></span>Watch all videos on YouTube</a
		>{/if}<button class="mediaFilter" aria-pressed="false" data-media-filter="english" type="button"
		><span class="icon-[carbon--checkbox]" aria-hidden="true"></span>English Only</button
	>
</div>
{#each byYear as [year, yearItems]}
	<WorksSection title={year} filter="media"
		><WorksList
			>{#each yearItems as item}
				{@const details = kindDetails[item.kind ?? 'podcast']}
				<li class="mediaItem" data-media-item data-lang={item.lang ?? 'ja'}>
					<h3 class="mediaTitle">
						<a class="mediaLink" href={item.link} rel="noopener noreferrer" target="_blank"
							>{item.title}</a
						>
					</h3>
					<p class="mediaMeta">
						<span class={`${details.icon} mediaKindIcon`} aria-hidden="true"
						></span>{details.label}<time class="mediaDate" datetime={item.pubDate}
							>{formatDate(new Date(item.pubDate))}</time
						>
					</p>
				</li>
			{/each}</WorksList
		></WorksSection
	>
{/each}

<style>
	.mediaControls {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-inline: auto;
		padding-top: 2.5rem;
	}

	.mediaControlLink {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-block: auto;
		opacity: 0.3;
	}

	.mediaFilter {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.875rem;
		opacity: 0.3;
	}

	.mediaItem {
		margin-block: 1.25rem;
	}

	.mediaTitle {
		font-size: 1.25rem;
		line-height: 1.75rem;
		opacity: 0.7;
		transition:
			opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.mediaTitle:hover {
		opacity: 0.8;
	}

	.mediaLink {
		text-decoration: underline;
	}

	.mediaMeta {
		opacity: 0.5;
	}

	.mediaKindIcon {
		margin-right: 0.25rem;
	}

	.mediaDate {
		display: inline-block;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding-left: 0.5rem;
		font-size: 0.875rem;
		opacity: 0.8;
	}

	:global(html.dark) .mediaTitle {
		opacity: 0.5;
	}

	@media (prefers-color-scheme: dark) {
		:global(html:not(.js)) .mediaTitle {
			opacity: 0.5;
		}
	}
</style>

<script lang="ts">
	import { formatDate } from '@/lib/date.ts';

	import WorksNav from '@/components/WorksNav/index.svelte';

	import WorksSection from '@/components/WorksSection/index.svelte';
	import WorksList from '@/components/WorksSection/WorksList.svelte';

	import type { Talk } from './data.ts';

	type TalksProps = {
		talks: Talk[];
	};

	let { talks }: TalksProps = $props();

	const byYear = $derived(
		[...Map.groupBy(talks, (talk) => new Date(talk.date).getFullYear()).entries()].sort(
			([a], [b]) => b - a,
		),
	);
</script>

<div class="talksPage">
	<WorksNav active="talks"></WorksNav>
	<div class="talksControls">
		<a
			class="talksControlLink"
			href="https://talks.ryoppippi.com/feed.xml"
			rel="noopener noreferrer"
			target="_blank"
		>
			<span class="icon-[line-md--rss]" aria-hidden="true"></span>
			Feed
		</a>
		<a class="talksControlLink" href="/yt-talks" rel="noopener noreferrer" target="_blank">
			<span class="icon-[ri--youtube-line]" aria-hidden="true"></span>
			Watch all talks on YouTube
		</a>
		<button class="talksFilter" aria-pressed="false" data-talk-filter="english" type="button">
			<span class="icon-[carbon--checkbox]" aria-hidden="true"></span>
			English Only
		</button>
	</div>
	{#each byYear as [year, items]}
		<WorksSection title={year} filter="talk">
			<WorksList>
				{#each items as talk}
					{const link = $derived(talk.links.at(0))}
					{const event = $derived(talk.event === 'テックワールド' ? 'TECH WORLD' : talk.event)}
					<li class="talkItem" data-talk-item data-lang={talk.lang ?? 'en'}>
						<h3 class="talkTitle">
							{#if link == null}
								{talk.title}
							{:else}
								<a class="talkLink" href={link} rel="noopener noreferrer" target="_blank">
									{talk.title}
								</a>
							{/if}
						</h3>
						<p class="talkMeta">
							{#if talk.eventLink == null}
								{event}
							{:else}
								<a class="talkLink" href={talk.eventLink} rel="noopener noreferrer" target="_blank">
									{event}
								</a>
							{/if}
							<time class="talkDate" datetime={talk.date}>{formatDate(new Date(talk.date))}</time>
						</p>
						{#if talk.videoLink != null}
							<p class="talkVideo">
								<a class="talkLink" href={talk.videoLink} rel="noopener noreferrer" target="_blank">
									Watch the video
								</a>
							</p>
						{/if}
					</li>
				{/each}
			</WorksList>
		</WorksSection>
	{/each}
</div>

<style>
	.talksControls {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-inline: auto;
		padding-top: 2.5rem;
	}

	.talksControlLink {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-block: auto;
		opacity: 0.3;
	}

	.talksFilter {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.875rem;
		opacity: 0.3;
	}

	.talkItem {
		margin-block: 1.25rem;
	}

	.talkTitle {
		font-size: 1.25rem;
		line-height: 1.75rem;
		opacity: 0.7;
		transition:
			opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.talkTitle:hover {
		opacity: 0.8;
	}

	.talkLink {
		text-decoration: underline;
	}

	.talkMeta {
		opacity: 0.5;
	}

	.talkDate {
		display: inline-block;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding-left: 0.5rem;
		font-size: 0.875rem;
		opacity: 0.8;
	}

	.talkVideo {
		font-size: 0.875rem;
		opacity: 0.5;
	}

	:global(html.dark) .talkTitle {
		opacity: 0.5;
	}

	:global(html.dark) .talksPage :global(h2) {
		opacity: 0.2;
	}

	@media (prefers-color-scheme: dark) {
		:global(html:not(.js)) .talkTitle {
			opacity: 0.5;
		}

		:global(html:not(.js)) .talksPage :global(h2) {
			opacity: 0.2;
		}
	}
</style>

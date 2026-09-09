<script lang="ts">
	import type { ShowcaseProject } from '@/pages/works/showcase/data.ts';

	import { formatDate } from '@/lib/date.ts';

	import WorksNav from '@/components/WorksNav/index.svelte';

	type ShowcaseProps = {
		projects: ShowcaseProject[];
	};

	let { projects }: ShowcaseProps = $props();
</script>

<WorksNav active="showcase"></WorksNav>
<div class="showcaseGrid">
	{#each projects as project}
		{@const external = project.link.startsWith('http')}
		<article class="showcaseCard">
			<a
				class="showcaseImageLink"
				href={project.link}
				rel={external ? 'noopener noreferrer' : undefined}
				target={external ? '_blank' : undefined}
				>{#if project.image != null}<img
						class="showcaseImage"
						alt={project.title}
						src={project.image}
					/>{/if}</a
			>
			<div class="showcaseDetails">
				<h2 class="showcaseTitle">
					<a
						href={project.link}
						rel={external ? 'noopener noreferrer' : undefined}
						target={external ? '_blank' : undefined}>{project.title}</a
					>
				</h2>
				<div class="prose">{@html project.html}</div>
				<p class="showcaseDate">{formatDate(new Date(project.pubDate))}</p>
			</div>
		</article>
	{/each}
</div>

<style>
	.showcaseGrid {
		display: grid;
		grid-template-columns: repeat(1, minmax(0, 1fr));
		gap: 1rem;
	}

	.showcaseCard {
		overflow: hidden;
		border: 1px solid #8884;
		border-radius: 0.5rem;
		transition:
			transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.showcaseCard:hover {
		transform: scale(1.01);
		box-shadow:
			0 20px 25px -5px rgb(0 0 0 / 10%),
			0 8px 10px -6px rgb(0 0 0 / 10%);
	}

	.showcaseImageLink {
		display: block;
	}

	.showcaseImage {
		width: 100%;
		aspect-ratio: 16 / 9;
		border-bottom: 1px solid #8884;
		object-fit: cover;
	}

	.showcaseDetails {
		padding: 1rem;
		opacity: 0.7;
		transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.showcaseCard:hover .showcaseDetails {
		opacity: 0.8;
	}

	.showcaseTitle {
		font-size: 1.5rem;
		line-height: 2rem;
	}

	.showcaseDate {
		padding-top: 0.5rem;
		font-size: 0.875rem;
		opacity: 0.5;
	}

	:global(html.dark) .showcaseDetails {
		opacity: 0.5;
	}

	@media (prefers-color-scheme: dark) {
		:global(html:not(.js)) .showcaseDetails {
			opacity: 0.5;
		}
	}

	@media (min-width: 64rem) {
		.showcaseGrid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>

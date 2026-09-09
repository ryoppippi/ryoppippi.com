<script lang="ts">
	import WorksNav from '@/components/WorksNav/index.svelte';

	import WorksSection from '@/components/WorksSection/index.svelte';
	import WorksList from '@/components/WorksSection/WorksList.svelte';

	type Publication = {
		authors: string;
		link: string;
		publisher: string;
		title: string;
	};

	type PublicationsProps = {
		publications: Record<string, Publication[]>;
	};

	let { publications }: PublicationsProps = $props();

	const years = $derived(Object.entries(publications).sort(([a], [b]) => Number(b) - Number(a)));
</script>

<div class="publicationsPage">
	<WorksNav active="publications"></WorksNav>{#each years as [year, items]}
		<WorksSection title={year}
			><WorksList
				>{#each items as item}
					<li class="publicationItem">
						<a class="publicationLink" href={item.link} rel="noopener noreferrer" target="_blank"
							>{item.title}</a
						>
						<p class="publicationPublisher">{item.publisher}</p>
					</li>
				{/each}</WorksList
			></WorksSection
		>
	{/each}
</div>

<style>
	.publicationItem {
		margin-block: 1.25rem;
	}

	.publicationLink {
		display: inline;
		font-size: 1.25rem;
		line-height: 1.75rem;
		opacity: 0.7;
		text-decoration: underline;
		transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.publicationLink:hover {
		opacity: 0.8;
	}

	:global(html.dark) .publicationLink {
		opacity: 0.5;
	}

	:global(html.dark) .publicationLink:hover {
		opacity: 0.8;
	}

	.publicationPublisher {
		opacity: 0.5;
	}

	:global(html.dark) .publicationsPage :global(h2) {
		opacity: 0.2;
	}

	@media (prefers-color-scheme: dark) {
		:global(html:not(.js)) .publicationLink {
			opacity: 0.5;
		}

		:global(html:not(.js)) .publicationLink:hover {
			opacity: 0.8;
		}

		:global(html:not(.js)) .publicationsPage :global(h2) {
			opacity: 0.2;
		}
	}
</style>

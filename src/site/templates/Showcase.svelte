<script lang='ts'>
	import { createRawSnippet } from 'svelte';
	import type { ShowcaseProject } from '@ryoppippi/content';
	import { formatDate } from '../../lib/util.ts';
	import WorksNav from './WorksNav.svelte';

	let { projects }: { projects: ShowcaseProject[] } = $props();
</script>

<WorksNav active='showcase' />

<div class='grid grid-cols-1 gap-4 lg:grid-cols-2'>
	{#each projects as project (project.link)}
		{@const content = createRawSnippet(() => ({ render: () => project.html }))}
		<article class='group overflow-hidden rounded-lg border border-base transition-base hover:scale-[1.01] hover:shadow-xl'>
			<a href={project.link} rel={project.link.startsWith('http') ? 'noopener noreferrer' : undefined} target={project.link.startsWith('http') ? '_blank' : undefined}>
				{#if project.image != null}
					<img class='aspect-video w-full border-b border-base object-cover' alt={project.title} src={project.image} />
				{/if}
			</a>
			<div class='p-4 op-card'>
				<h2 class='text-2xl'>
					<a href={project.link} rel={project.link.startsWith('http') ? 'noopener noreferrer' : undefined} target={project.link.startsWith('http') ? '_blank' : undefined}>{project.title}</a>
				</h2>
				<div class='prose dark:prose-invert'>{@render content()}</div>
				<p class='pt-2 text-sm opacity-50'>{formatDate(new Date(project.pubDate))}</p>
			</div>
		</article>
	{/each}
</div>

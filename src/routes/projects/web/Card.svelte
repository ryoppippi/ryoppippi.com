<script lang='ts'>
	import type { load } from './+page.ts';
	import { formatDate } from '$lib/util';

	type Project = ReturnType<typeof load>['projects'][0];

	type Props = {
		project: Project;
	};

	const {
		project,
	}: Props = $props();
</script>

{#snippet projectLink(children)}
	<a href={project.link} no-underline>
		{@render children()}
	</a>
{/snippet}

<div
	class='group'
	border='~ base rounded-lg'
	hover='scale-101 shadow-xl z-10'
	select-none
	target={project.link.startsWith('http') ? '_blank' : '_self'}
	transition-base
>
	{#snippet _a()}
	{#if project.image != null}
			{#if typeof project.image === 'string'}
				<img
					alt={project.title}
					aspect-video
					border='b base'
					object-cover
					src={project.image}
					w-full
				/>
			{:else}
				<enhanced:img
					alt={project.title}
					aspect-video
					border='b base'
					object-cover
					src={project.image.default}
					w-full
				/>
			{/if}
	{/if}
		{/snippet}
	{@render projectLink(_a)}

	<div
		m0
		mt--8
		op-card
		p4
		pb3
		prose='base sm'
		transition-base
	>
		{#snippet title()} {project.title}{/snippet}
		<h3 hover-underline>{@render projectLink(title)}</h3>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html project.content}
		{#if project.pubDate}
			<div op50 pt2 text-sm>
				{formatDate(new Date(project.pubDate))}
			</div>
		{/if}
	</div>
</div>

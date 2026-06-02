<script lang='ts'>
	import type { Project } from '$contents/works/showcase';
	import { formatDate } from '$lib/util';
	import Image from './Image.svelte';

	type Props = {
		project: typeof Project.infer;
	};

	const {
		project,
	}: Props = $props();

	const { Content } = project;
</script>

<div
	style:view-transition-name={project.title}
	class='group select-none rounded-lg border border-base transition-base hover:z-10 hover:scale-[1.01] hover:shadow-xl'
>
	<a
		class='no-underline'
		href={project.link}
		rel={project.link.startsWith('http') ? 'noopener noreferrer' : undefined}
		target={project.link.startsWith('http') ? '_blank' : '_self'}
	>
		{#if project.image != null}
			<Image
				class='aspect-video w-full border-b border-base object-cover'
				alt={project.title}
				src={project.image}
			/>
		{/if}
	</a>

	<div class='p-4 pb-3 op-card transition-base'
	>
		<a
			href={project.link}
			rel={project.link.startsWith('http') ? 'noopener noreferrer' : undefined}
			target={project.link.startsWith('http') ? '_blank' : undefined}
		>
			<h2 class='text-2xl hover:underline'>
				{project.title}
			</h2>
		</a>
		<div class='prose prose-base sm:prose-sm'><Content /></div>
		{#if project.pubDate}
			<div class='pt-2 text-sm opacity-50'>
				{formatDate(new Date(project.pubDate))}
			</div>
		{/if}
	</div>
</div>

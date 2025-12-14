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
	class='group'
	border='~ base rounded-lg'
	hover='scale-101 shadow-xl z-10'
	select-none
	target={project.link.startsWith('http') ? '_blank' : '_self'}
	transition-base
>
	<a href={project.link} no-underline target={project.link.startsWith('http') ? '_blank' : '_self'}>
		{#if project.image != null}
			<Image
				alt={project.title}
				aspect-video='~'
				border='b base'
				object-cover='~'
				src={project.image}
				w-full='~'
			/>
		{/if}
	</a>

	<div
		op-card
		p4
		pb3
		transition-base
	>
		<a href={project.link}>
			<h3 hover-underline text-2xl>
				{project.title}
			</h3>
		</a>
		<div prose='base sm'><Content /></div>
		{#if project.pubDate}
			<div op50 pt2 text-sm>
				{formatDate(new Date(project.pubDate))}
			</div>
		{/if}
	</div>
</div>

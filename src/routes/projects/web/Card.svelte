<script lang='ts'>
	import type { Project } from '$contents/projects/web';
	import { formatDate } from '$lib/util';

	type Props = {
		project: Project;
	};

	const {
		project,
	}: Props = $props();
</script>

<div
	class='group'
	border='~ base rounded-lg'
	hover='scale-101 shadow-xl z-10'
	select-none
	target={project.link.startsWith('http') ? '_blank' : '_self'}
	transition-base
>
	<a href={project.link}>
		{#if typeof project.image === 'string'}
			<img
				alt={project.title}
				border='b base'
				src={project.image}
			/>
		{:else}
			<enhanced:img
				alt={project.title}
				border='b base'
				src={project.image}
			/>
		{/if}

		<div
			m0
			mt--8
			op-card
			p4
			pb3
			prose='base sm'
			transition-base
		>
			<h3> {project.title}</h3>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html project.content}
			{#if project.pubDate}
				<div op50 pt2 text-sm>
					{formatDate(new Date(project.pubDate))}
				</div>
			{/if}
		</div>
	</a>
</div>

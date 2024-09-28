<script lang='ts'>
	import type { Project } from '$contents/projects/web';

	type Props = {
		project: Project;
	};

	const {
		project,
	}: Props = $props();
</script>

<div
	border='~ base rounded-lg'
	hover='scale-101 shadow-xl z-10'
	target={project.link.startsWith('http') ? '_blank' : '_self'}
	transition='all duration-500'
>
	<a href={project.link}>
		{#if typeof project.image === 'string'}
			<img
				alt={project.title}
				src={project.image}
			/>
		{:else}
			<enhanced:img
				alt={project.title}
				src={project.image}
			/>
		{/if}

		<div border-none m0 ma p4 pb3 prose-base>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html project.content}
		</div>
	</a>
</div>

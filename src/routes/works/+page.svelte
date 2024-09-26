<script lang='ts'>
	import ProjectCard from './ProjectCard.svelte';

	const { data } = $props();
	const { projects } = data;
</script>

you can also check <a href='https://ryoppippi.com/pr' target='_blank'>my reset PRs</a>

{#each Object.entries(projects) as [genre, projectsByGenrne], count (genre)}
	<div style:--stagger={count}>
		<h2
			op50
			py-8
			text='4xl stroke-hex-aaa'
		>
			{genre}
		</h2>
		<div
			class='[--delay:300ms] sm:[--delay:450ms]'
			grid='~ cols-1 md:cols-2 gap-8'
		>
			{#each projectsByGenrne as project (project.link)}
				<ProjectCard {project} />
			{/each}
		</div>
	</div>
{/each}

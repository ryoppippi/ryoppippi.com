<script lang='ts'>
	const { data } = $props();
	const { projects } = data;
</script>

<div text-center>
	<GitHubNav />
</div>

<div grid='~ gap-16'>
	{#each Object.entries(projects) as [genre, projectsByGenrne], count (genre)}
		<div
			style:--stagger={count}
			sliding-animation='~ delay-base'
		>
			<LargeTitle title={genre} />
			<div
				grid='~ gap-8'
				grid-cols='1 md:2'
			>
				{#each projectsByGenrne as project (project.link)}
					<OssProjectCard {project} />
				{/each}
			</div>
		</div>
	{/each}
</div>

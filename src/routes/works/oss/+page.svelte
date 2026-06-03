<script lang='ts'>
	import GitHubNav from '$components/GitHubNav.svelte';
	import LargeTitle from '$components/LargeTitle.svelte';
	import OssProjectCard from '$components/OssProjectCard.svelte';

	const { data } = $props();
	const { projects } = data;
</script>

<div class='text-center'>
	<GitHubNav />
</div>

<div class='grid gap-16'>
	{#each Object.entries(projects) as [genre, projectsByGenrne] (genre)}
		<div>
			<LargeTitle level={2} title={genre} />
			<div class='grid grid-cols-1 gap-8 md:grid-cols-2'
			>
				{#each projectsByGenrne as project (project.link)}
					<OssProjectCard {project} />
				{/each}
			</div>
		</div>
	{/each}
</div>

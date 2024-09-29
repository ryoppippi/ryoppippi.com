<script lang='ts'>
	import GitHubNav from './GitHubNav.svelte';
	import OssProjectCard from './OSSProjectCard.svelte';
	import HeadTitle from '$lib/HeadTitle.svelte';
	import LargeTitle from '$lib/LargeTitle.svelte';

	const { data } = $props();
	const { projects } = data;
</script>

<HeadTitle title='projects' />

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

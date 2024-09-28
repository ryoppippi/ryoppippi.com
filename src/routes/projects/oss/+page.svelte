<script lang='ts'>
	import GitHubNav from './GitHubNav.svelte';
	import OssProjectCard from './OSSProjectCard.svelte';
	import HeadTitle from '$lib/HeadTitle.svelte';

	const { data } = $props();
	const { projects } = data;
</script>

<HeadTitle title='projects' />

{#snippet genreTitle(genre: sting)}
  <h2
    f-text-32-64
    font='mono bold'
    line-height-none
    op='35 dark:20'
    py-8
    select-none
    text-stroke='hex-aaa [1.5px]'
    text-transparent
  >
    {genre}
  </h2>
{/snippet}

<div text-center>
	<GitHubNav />
</div>

<div grid='~ gap-16'>
	{#each Object.entries(projects) as [genre, projectsByGenrne], count (genre)}
		<div
			style:--stagger={count}
			data-sliding-animate
		>
			{@render genreTitle(genre)}
			<div
				class='[--delay:300ms] sm:[--delay:450ms]'
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

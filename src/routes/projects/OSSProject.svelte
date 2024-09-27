<script lang='ts'>
	import GithubNav from './GithubNav.svelte';
	import OssProjectCard from './OSSProjectCard.svelte';
	import type { ReturnType } from './+page.server.ts';

	const { projects }: { projects: ReturnType } = $props();
</script>

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
	<GithubNav />
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

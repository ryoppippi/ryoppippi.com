<script lang='ts'>
	import ProjectCard from './ProjectCard.svelte';
	import Title from '$lib/Title.svelte';
	import { domain } from '$lib/util';

	const { data } = $props();
	const { projects } = data;
</script>

<Title title='projects' />

{#snippet apo()}
	<span>&rsquo;</span>
{/snippet}

<div>
	<div text-center>
		<div font-mono>
			<h1
				font-bold
				pb-4
				text-5xl
			>
				Projects
			</h1>
			<p italic mb5 op50 text-lg>
				... that I (created | {@render apo()}m workin{@render apo()} on)
			</p>
		</div>

		<div
			mt10
			mxa
			pb5
			prose='~ dark:invert'
		>
			<div flex='~ gap-2 justify-center'>
				<a
					btn-green
					flex='~ col md:row items-center'
					href='{domain()}/pr'
					target='_blank'
				>
					<!-- svelte-ignore element_invalid_self_closing_tag -->
					<span i-ph-git-pull-request-duotone /> My Recent PRs
				</a>
				<a
					btn-blue
					flex='~ col md:row items-center'
					href='{domain()}/gh'
					target='_blank'
				>
					<!-- svelte-ignore element_invalid_self_closing_tag -->
					<span i-ph-github-logo-duotone /> GitHub
				</a>
				<a
					btn-pink
					flex='~ col md:row items-center'
					href='{domain()}/gh-by-stars'
					target='_blank'
				>
					<!-- svelte-ignore element_invalid_self_closing_tag -->
					<span i-ph-star /> Sort by Stars
				</a>
			</div>
		</div>

	</div>

	<div grid='~ gap-16'>
		{#each Object.entries(projects) as [genre, projectsByGenrne], count (genre)}
			<div
				style:--stagger={count}
				data-sliding-animate
			>
				<h2
					font='mono bold'
					line-height-none
					op='35 dark:20'
					py-8
					select-none
					text='size-4.0em transparent'
					text-stroke='hex-aaa [1.5px]'
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
	</div>
</div>

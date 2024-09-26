<script lang='ts'>
	import ProjectCard from './ProjectCard.svelte';

	const { data } = $props();
	const { projects } = data;
</script>

<div>
	<div text-center>
		<div font-mono>
			<h1
				font-bold
				pb-4
				text-5xl
			>
				Porjects
			</h1>
			<p italic mb5 op50 text-lg>
				... that I've worked on
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
					href='https://ryoppippi.com/pr'
					target='_blank'
				>
					<!-- svelte-ignore element_invalid_self_closing_tag -->
					<span i-ph-git-pull-request-duotone /> My Recent PRs
				</a>
				<a
					btn-blue
					flex='~ col md:row items-center'
					href='https://ryoppippi.com/gh'
					target='_blank'
				>
					<!-- svelte-ignore element_invalid_self_closing_tag -->
					<span i-ph-github-logo-duotone /> GitHub
				</a>
				<a
					btn-pink
					flex='~ col md:row items-center'
					href='https://ryoppippi.com/gh-by-stars'
					target='_blank'
				>
					<!-- svelte-ignore element_invalid_self_closing_tag -->
					<span i-ph-star /> Sort by Stars
				</a>
			</div>
		</div>
	</div>

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
</div>

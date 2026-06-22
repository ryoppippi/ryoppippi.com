<script lang='ts'>
	import type { OssProject } from '../sections.ts';
	import WorksNav from './WorksNav.svelte';

	let { projects }: { projects: Record<string, OssProject[]> } = $props();
</script>

<WorksNav active='oss' />

<div class='prose mx-auto mt-10 pb-5 text-center dark:prose-invert'>
	<div class='fxc gap-2'>
		<a class='btn-green fcol-md-row fyc gap-1' href='https://ryoppippi.com/pr' rel='noopener noreferrer' target='_blank'>
			<span class='icon-[ph--git-pull-request-duotone]' aria-hidden='true'></span>My Recent PRs
		</a>
		<a class='btn-blue fcol-md-row fyc gap-1' href='https://ryoppippi.com/gh' rel='noopener noreferrer' target='_blank'>
			<span class='icon-[ph--github-logo-duotone]' aria-hidden='true'></span>GitHub
		</a>
		<a class='btn-pink fcol-md-row fyc gap-1' href='https://ryoppippi.com/gh-by-stars' rel='noopener noreferrer' target='_blank'>
			<span class='icon-[ph--star]' aria-hidden='true'></span>Sort by Stars
		</a>
	</div>
</div>

<div class='grid gap-16'>
	{#each Object.entries(projects) as [genre, items] (genre)}
		<section>
			<h2 class='f-text-32-64 my-8 font-mono font-bold leading-none text-stroke-aaa text-transparent opacity-35 dark:opacity-20'>{genre}</h2>
			<div class='grid grid-cols-1 gap-8 md:grid-cols-2'>
				{#each items as project (project.link)}
					<a class='grid grid-cols-5 max-w-full select-none font-sans no-underline op-card transition-base hover:scale-[1.01] hover:shadow-xl' href={project.link} rel='noopener noreferrer' target='_blank'>
						<div class='gcc'><span class={`${project.icon} text-3xl opacity-50`} aria-hidden='true'></span></div>
						<div class='fcol col-span-4'>
							<div class='truncate text-lg'>{project.name}</div>
							<p class='h-8 line-clamp-2 text-xs'>{project.description ?? ''}</p>
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/each}
</div>

<script lang='ts'>
	import type { OssProject } from '../sections.ts';
	import { SITE_ORIGIN } from '../consts.ts';
	import WorksNav from './WorksNav.svelte';

	let { projects }: { projects: OssProject[] } = $props();

	function formatStars(stars: number): string {
		return new Intl.NumberFormat('en', {
			maximumFractionDigits: 1,
			notation: 'compact',
		}).format(stars);
	}
</script>

<WorksNav active='oss' />

<div class='prose mx-auto mt-10 pb-5 text-center dark:prose-invert'>
	<div class='fxc gap-2'>
		<a class='btn-green fcol-md-row fyc gap-1' href={`${SITE_ORIGIN}/pr`} rel='noopener noreferrer' target='_blank'>
			<span class='icon-[ph--git-pull-request-duotone]' aria-hidden='true'></span>My Recent PRs
		</a>
		<a class='btn-blue fcol-md-row fyc gap-1' href={`${SITE_ORIGIN}/gh`} rel='noopener noreferrer' target='_blank'>
			<span class='icon-[ph--github-logo-duotone]' aria-hidden='true'></span>GitHub
		</a>
		<a class='btn-pink fcol-md-row fyc gap-1' href={`${SITE_ORIGIN}/gh-by-stars`} rel='noopener noreferrer' target='_blank'>
			<span class='icon-[ph--star]' aria-hidden='true'></span>Sort by Stars
		</a>
	</div>
	<p class='mt-3 text-xs opacity-60'>GitHub star counts for my repositories are refreshed daily.</p>
</div>


<div class='mt-12 grid grid-cols-1 gap-8 md:grid-cols-2'>
	{#each projects as project (project.link)}
		<a class='grid grid-cols-5 max-w-full select-none font-sans no-underline op-card transition-base hover:scale-[1.01] hover:shadow-xl' href={project.link} rel='noopener noreferrer' target='_blank'>
			<div class='gcc'><span class={`${project.icon} text-3xl opacity-50`} aria-hidden='true'></span></div>
			<div class='fcol col-span-4 gap-2'>
				<div class='fyc justify-between gap-2'>
					<div class='truncate text-lg'>{project.name}</div>
					{#if project.stars != null}
						<span class='fyc shrink-0 gap-1 text-sm opacity-75' aria-label={`${project.stars.toLocaleString('en-US')} GitHub stars`} title={`${project.stars.toLocaleString('en-US')} GitHub stars`}>
							<span class='icon-[ph--star] text-base' aria-hidden='true'></span>
							{formatStars(project.stars)}
						</span>
					{/if}
				</div>
				<p class='min-h-8 line-clamp-2 text-xs'>{project.description ?? ''}</p>
				<div class='fyc fw gap-1'>
					{#each project.tags as tag (tag)}
						<span class='rounded border border-base px-1.5 py-0.5 font-mono text-[0.65rem] leading-none opacity-70'>{tag}</span>
					{/each}
				</div>
			</div>
		</a>
	{/each}
</div>

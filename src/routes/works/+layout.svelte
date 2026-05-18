<script lang='ts'>
	import { page } from '$app/state';
	import ProjectTitle from '$components/ProjectTitle.svelte';
	import { capitalize, lowercase } from '@ryoppippi/str-fns';

	const routes = [
		'OSS',
		'showcase',
		'talks',
		'publications',
	] as const;

	const { children } = $props();
</script>

<div>
	<ProjectTitle />

	<nav
		aria-label='Works sections'
		fcol-sm-row
		fw
		gap='1 sm:3'
		mb-8
		text-3xl
	>
		{#each routes as route (route)}
			{@const lowercaseRoute = lowercase(route)}
			{@const isCurrent = page.route.id?.endsWith(lowercaseRoute)}
			<a
				style:--nav-title='project-nav-{route}'
				style:view-transition-name='project-nav-{route}'
				class={{ op70: isCurrent }}
				aria-current={isCurrent ? 'page' : undefined}
				href={isCurrent ? null : lowercaseRoute}
				op20
			>{capitalize(route)}</a>
		{/each}
	</nav>

	{@render children()}
</div>

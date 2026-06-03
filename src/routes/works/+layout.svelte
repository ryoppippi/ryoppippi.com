<script lang='ts'>
	import { page } from '$app/state';
	import ProjectTitle from '$components/ProjectTitle.svelte';
	import { capitalize, lowercase } from '@ryoppippi/str-fns';
	import './layout.css';

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
		class='fcol-sm-row fw mb-8 gap-1 text-3xl sm:gap-3'
		aria-label='Works sections'
	>
		{#each routes as route (route)}
			{@const lowercaseRoute = lowercase(route)}
			{@const isCurrent = page.route.id?.endsWith(lowercaseRoute)}
			<a
				style:--nav-title='project-nav-{route}'
				style:view-transition-name='project-nav-{route}'
				class={['opacity-20', { 'opacity-70': isCurrent }]}
				aria-current={isCurrent ? 'page' : undefined}
				href={isCurrent ? null : lowercaseRoute}
			>{capitalize(route)}</a>
		{/each}
	</nav>

	{@render children()}
</div>

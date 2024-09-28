<script lang='ts'>
	import { capitalize } from '@ryoppippi/str-fns';
	import ProjectTitle from './ProjectTitle.svelte';
	import Title from '$lib/Title.svelte';
	import { page } from '$app/stores';

	const routes = [
		'oss',
		'web',
		'art',
		'academic',
	] as const;

	const { children } = $props();
</script>

<Title title='projects' />

<div>
	<div text-center>
		<ProjectTitle />
	</div>

	<div
		fcol-sm-row
		fw
		gap='1 sm:3'
		mb-8
		text-3xl
	>
		{#each routes as route (route)}
			{@const isCurrent = $page.route.id?.endsWith(route)}
			<a
				style:--nav-title='project-nav-{route}'
				class:op70={isCurrent}
				href={isCurrent ? null : route}
				op20
				view-transition='-[--nav-title]'
			>{capitalize(route)}</a>
		{/each}
	</div>

	{@render children()}
</div>

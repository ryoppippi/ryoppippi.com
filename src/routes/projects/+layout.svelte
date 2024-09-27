<script lang='ts'>
	import { capitalize } from '@ryoppippi/str-fns';
	import ProjectTitle from './ProjectTitle.svelte';
	import Title from '$lib/Title.svelte';
	import { page } from '$app/stores';

	const routes = [
		'oss',
		'art',
	] as const;

	const { children } = $props();
</script>

<Title title='projects' />

<div>
	<div text-center>
		<ProjectTitle />
	</div>

	<div
		flex='~ col sm:row wrap'
		gap='1 sm:3'
		mb-0
		text-3xl
	>
		{#each routes as route (route)}
			{@const isCurrent = $page.route.id?.endsWith(route)}
			<a
				class:op100={isCurrent}
				href={isCurrent ? null : route}
				op50
			>{capitalize(route)}</a>
		{/each}
	</div>

	{@render children()}
</div>

<script lang='ts'>
	import ProjectTitle from './ProjectTitle.svelte';
	import Title from '$lib/Title.svelte';

	const { children } = $props();
</script>

<Title title='projects' />

<div>
	<div text-center>
		<ProjectTitle />
	</div>

	<div
		flex='~ col gap-1 sm:row sm:gap-3 wrap'
		mb-0
		text-3xl>
		<a href='/projects'>OSS</a>
	</div>

	{@render children()}
</div>

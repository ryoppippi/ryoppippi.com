<script lang='ts'>
	import Card from './Card.svelte';

	const { data } = $props();
	const { projects } = data;
</script>

<div
	grid='~ gap-4'
	grid-cols='1 lg:2'
>
	{#each projects as project (project.slug)}
		<Card {project} />
	{/each}
</div>

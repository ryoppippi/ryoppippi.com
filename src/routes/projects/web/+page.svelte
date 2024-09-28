<script lang='ts'>
	import Card from './Card.svelte';

	const { data } = $props();
	const { projects } = data;
</script>

<div
	grid='~ gap-4'
	grid-cols='1 lg:2 xl:3'
>
	{#each projects as project, count (project.slug)}
		<div
			style:--stagger={count}
			data-sliding-animate
		>
			<Card {project} />
		</div>
	{/each}

</div>

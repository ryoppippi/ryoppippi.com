<script lang='ts'>
	import Card from './Card.svelte';

	const { data } = $props();
	const { projects } = data;
</script>

<div
	grid='~ gap-4'
	grid-cols='1 lg:2'
>
	{#each projects as project, count (project.slug)}
		<div
			style:--stagger={count}
			sliding-animation='~ delay-base'
		>
			<Card {project} />
		</div>
	{/each}

</div>

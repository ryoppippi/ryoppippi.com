<script lang='ts'>
	const { data } = $props();
	const { projects } = data;

</script>

<div
	grid='~ gap-4'
	grid-cols='1 lg:2'
>
	<!-- eslint-disable-next-line svelte/require-each-key -->
	{#each projects as project, count}
		<div
			style:--stagger={count}
			sliding-animation='~ delay-base'
		>
			<ShowcaseCard {project} />
		</div>
	{/each}

</div>

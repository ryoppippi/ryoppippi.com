<script lang='ts'>
	const { data } = $props();
	const { projects } = data;

</script>

<div
	grid='~ gap-4'
	grid-cols='1 lg:2'
>
	{#each projects as project, count (count)}
		<div>
			<ShowcaseCard {project} />
		</div>
	{/each}

</div>

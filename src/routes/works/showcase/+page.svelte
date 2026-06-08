<script lang='ts'>
	import ShowcaseCard from '$components/ShowcaseCard.svelte';

	const { data } = $props();
	const { projects } = $derived(data);

</script>

<div class='grid grid-cols-1 gap-4 lg:grid-cols-2'
>
	{#each projects as project, count (count)}
		<div>
			<ShowcaseCard {project} />
		</div>
	{/each}

</div>

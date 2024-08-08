<script lang='ts'>
	import Chip from '$lib/Chip.svelte';

	let { items = $bindable({}) }: { items: Record<string, boolean> } = $props();
</script>

<div class='justify-begin mb-5 flex select-none space-x-2'>
	{#each Object.keys(items) as i (i)}
		{@const id = `cb-${i}`}
		<Chip {id} icon='i-mdi:check' text={i} bind:checked={items[i]} />
	{/each}
</div>

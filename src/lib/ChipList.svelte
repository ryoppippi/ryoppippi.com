<script lang='ts'>
	import IconCheck from '~icons/mdi/check';
	import Chip from '$lib/Chip.svelte';

	let { items = $bindable({}) }: { items: Record<string, boolean> } = $props();
</script>

<div class='justify-begin mb-5 flex select-none space-x-2'>
	{#each Object.keys(items) as i (i)}
		{@const id = `cb-${i}`}
		<Chip {id} icon={IconCheck} text={i} bind:checked={items[i]} />
	{/each}
</div>

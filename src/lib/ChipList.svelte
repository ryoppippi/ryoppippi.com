<script>
	/** @type{Record<string, boolean>} */
	export let items = {};

	import IconCheck from '~icons/mdi/check';
	import Chip from '$lib/Chip.svelte';
</script>

<div class='justify-begin mb-5 flex select-none space-x-2'>
	{#each Object.keys(items) as i (i)}
		{@const id = `cb-${i}`}
		<Chip {id} icon={IconCheck} text={i} bind:checked={items[i]} />
	{/each}
</div>

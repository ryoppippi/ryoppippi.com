<script>
	/** @type{Record<string, boolean>} */
	export let items = {};

	import IconCheck from '~icons/mdi/check';
	import Chip from '$lib/Chip.svelte';
</script>

<div class="justify-begin mb-5 flex select-none space-x-2">
	{#each Object.keys(items) as i}
		{@const id = `cb-${i}`}
		<Chip {id} text={i} bind:checked={items[i]} icon={IconCheck} />
	{/each}
</div>

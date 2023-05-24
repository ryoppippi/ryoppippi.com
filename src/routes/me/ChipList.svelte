<script>
	/** @type{Record<string, boolean>} */
	export let items = {};

	import IconCheck from '~icons/mdi/check';
</script>

<div class="justify-begin mb-5 flex select-none space-x-2">
	{#each Object.keys(items) as i}
		{@const id = `cb-${i}`}
		<input type="checkbox" class="hidden" {id} bind:checked={items[i]} />
		<label for={id} class="chip {items[i] ? 'variant-filled' : 'variant-glass-soft'}" on:keypress>
			<span class="flex"
				>{i}
				{#if items[i]}
					<span class="peer-checked/{id}:hidden inline"><IconCheck /></span>
				{/if}
			</span>
		</label>
	{/each}
</div>

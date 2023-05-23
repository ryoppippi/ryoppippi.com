<script>
	/** @type{Record<string, boolean>} */
	export let items = {
		Expert: true,
		Middle: true,
		'Good w/ ChatGPT': true
	};

	import IconCheck from '~icons/mdi/check';
</script>

<div class="justify-begin mb-5 flex select-none space-x-2">
	{#each Object.keys(items) as i}
		<span
			class="chip {items[i] ? 'variant-filled' : 'variant-glass-soft'}"
			on:click={() => {
				items[i] = !items[i];
			}}
			on:keypress>
			<span class="">{i}</span>
			{#if items[i]}
				<span><IconCheck /></span>
			{/if}
		</span>
	{/each}
</div>

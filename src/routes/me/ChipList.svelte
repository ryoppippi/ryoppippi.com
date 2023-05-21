<script>
	/** @type{Record<string, boolean>} */
	export let items = {
		Expert: true,
		Middle: true,
		'Good w/ ChatGPT': true
	};

	import Icon from '@iconify/svelte';
</script>

<div class="justify-begin mb-5 flex space-x-2">
	{#each Object.keys(items) as i}
		<span
			class="chip {items[i] ? 'variant-filled' : 'variant-glass-soft'}"
			on:click={() => {
				items[i] = !items[i];
			}}
			on:keypress>
			{#if items[i]}
				<span><Icon icon="mdi:check" /></span>
			{/if}
			<span class="">{i}</span>
		</span>
	{/each}
</div>

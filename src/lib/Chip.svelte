<script>
	/** @type{string} */
	export let id;

	/** @type{string} */
	export let text;

	/** @type{boolean} */
	export let checked = false;

	/** @type{ConstructorOfATypedSvelteComponent} */
	export let icon;
</script>

<input type='checkbox' class='hidden' {id} bind:checked />
<label for={id} class="chip {checked ? 'variant-filled' : 'variant-glass-soft'}">
	<span class='flex'>
		{text}
		{#if checked}
			<span class='peer-checked/{id}:hidden inline'>
				<svelte:component this={icon} />
			</span>
		{/if}
	</span>
</label>

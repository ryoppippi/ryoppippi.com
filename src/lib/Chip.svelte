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

<input {id} class='hidden' type='checkbox' bind:checked />
<label class="chip {checked ? 'variant-filled' : 'variant-glass-soft'}" for={id}>
	<span class='flex'>
		{text}
		{#if checked}
			<span class='peer-checked/{id}:hidden inline'>
				<svelte:component this={icon} />
			</span>
		{/if}
	</span>
</label>

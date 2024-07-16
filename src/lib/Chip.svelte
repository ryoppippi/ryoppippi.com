<script lang='ts'>
	let {
		id,
		text,
		checked = $bindable(false),
		icon,
	}: {
		id: string;
		text: string;
		checked: boolean;
		icon: ConstructorOfATypedSvelteComponent;
	} = $props();
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

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
		icon: string;
	} = $props();
</script>

<input {id} class='hidden' type='checkbox' bind:checked />
<label class="chip {checked ? 'variant-filled' : 'variant-glass-soft'}" for={id}>
	<span class='flex'>
		{text}
		{#if checked}
			<!-- svelte-ignore element_invalid_self_closing_tag -->
			<span class='peer-checked/{id}:hidden inline'>
				<div class={icon} />
			</span>
		{/if}
	</span>
</label>

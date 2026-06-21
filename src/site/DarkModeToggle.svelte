<script lang='ts'>
	import * as DarkMode from 'svelte-fancy-darkmode';
</script>

<DarkMode.ToggleButton>
	{#snippet dark()}
		<span
			class='icon-[line-md--sunny-filled-loop-to-moon-filled-transition]'
			aria-hidden='true'
		></span>
	{/snippet}

	{#snippet light()}
		<span
			class='icon-[line-md--moon-filled-to-sunny-filled-loop-transition]'
			aria-hidden='true'
		></span>
	{/snippet}
</DarkMode.ToggleButton>

<script>
	import MoonToSunny from '~icons/line-md/moon-filled-to-sunny-filled-loop-transition';
	import SunnyToMoon from '~icons/line-md/sunny-filled-loop-to-moon-filled-transition';
	import { UseDarkMode } from './runes.svelte';

	const dark = new UseDarkMode();
</script>

<button
	aria-label='Toggle Dark Mode'
	onclick={dark.toggleDark}
	type='button'
>

	{#if dark.isDark}
		<SunnyToMoon />
	{:else}
		<MoonToSunny />
	{/if}
</button>

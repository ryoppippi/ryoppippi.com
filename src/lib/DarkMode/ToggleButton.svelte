<script>
	import { useDarkMode } from './runes.svelte';
	import MoonToSunny from '~icons/line-md/moon-filled-to-sunny-filled-loop-transition';
	import SunnyToMoon from '~icons/line-md/sunny-filled-loop-to-moon-filled-transition';

	const { isDark, toggleDark } = useDarkMode();
</script>

<button
	aria-label='Toggle Dark Mode'
	onclick={toggleDark}
	type='button'
>

	{#if isDark}
		<SunnyToMoon />
	{:else}
		<MoonToSunny />
	{/if}
</button>

<script>
	import MoonToSunny from '~icons/line-md/moon-filled-to-sunny-filled-loop-transition';
	import SunnyToMoon from '~icons/line-md/sunny-filled-loop-to-moon-filled-transition';
	import { dark } from './runes.svelte';

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

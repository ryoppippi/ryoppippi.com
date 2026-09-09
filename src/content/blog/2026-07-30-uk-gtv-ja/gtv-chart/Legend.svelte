<script lang="ts">
	import type { ChartLang } from './copy.ts';
	import { resolveChartLang, uiCopy } from './copy.ts';

	let { lang }: { lang?: ChartLang } = $props();
	const copy = $derived(uiCopy[resolveChartLang(lang)].legend);
</script>

<ul class="legend">
	{#each Object.entries(copy) as [key, label]}
		<li>
			<span aria-hidden="true" class={['swatch', `swatch--${key}`]}></span>
			{label}
		</li>
	{/each}
</ul>

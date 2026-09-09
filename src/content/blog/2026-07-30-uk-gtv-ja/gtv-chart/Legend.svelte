<script lang="ts">
	import type { ChartLang } from './copy.ts';
	import { resolveChartLang, uiCopy } from './copy.ts';

	let { lang }: { lang?: ChartLang } = $props();
	const copy = $derived(uiCopy[resolveChartLang(lang)].legend);
	const items = [
		'mid',
		'high',
		'low',
		'stars',
		'after',
	] as const satisfies readonly (keyof typeof copy)[];
</script>

<ul class="legend">
	{#each items as item}
		<li>
			<span aria-hidden="true" class={['swatch', `swatch--${item}`]}></span>
			{copy[item]}
		</li>
	{/each}
</ul>

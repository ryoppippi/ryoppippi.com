<script lang='ts'>
	import { Chart } from '@tanstack/svelte-charts';
	import { resolveChartLang, uiCopy, type ChartLang } from './copy.ts';
	import { buildChartDefinition } from './definition.ts';
	import { isRowMark } from './focus.ts';

	let { focused = $bindable(), lang = 'ja' }: { focused: number | null; lang?: ChartLang } =
		$props();

	const resolvedLang = $derived(resolveChartLang(lang));
	const copy = $derived(uiCopy[resolvedLang].chart);
	const definition = $derived(buildChartDefinition(focused, resolvedLang));
</script>

<!-- svelte-ignore a11y_no_static_element_interactions (pointer leave only clears chart focus) -->
<div onpointerleave={() => (focused = null)}>
	<Chart
		ariaLabel={copy.ariaLabel}
		ariaDescription={copy.ariaDescription}
		aspectRatio={2.2}
		class='canvas'
		{definition}
		onFocusChange={(point) => {
		// Only some marks are drawn from `rows`; the rest have their own datasets.
		focused = point != null && isRowMark(point.markId) ? point.datumIndex : null;
		}}
	/>
</div>

<style>
	:global(.canvas) {
		width: 100%;
	}
</style>

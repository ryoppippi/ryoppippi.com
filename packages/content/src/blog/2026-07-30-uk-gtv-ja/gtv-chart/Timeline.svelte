<script lang='ts'>
	import { Chart } from '@tanstack/svelte-charts';
	import { buildChartDefinition } from './definition.ts';
	import { isRowMark } from './focus.ts';

	let { focused = $bindable() }: { focused: number | null } = $props();

	// A fresh definition per focus state: the host re-renders when the
	// definition reference changes, and that is the only input channel left.
	const definition = $derived(buildChartDefinition(focused));
</script>

<!-- focusByX never returns nothing, so the pointer leaving is what clears it. -->
<div onpointerleave={() => (focused = null)}>
	<Chart
		ariaLabel='申請時点までの通過見込みの推定とccusageのstar数の推移'
		ariaDescription='矢印キーで時点を移動できる。詳しい値は直後の表にも掲載している。'
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

	/* The chart paints its own focus rings since 0.3.0, on top of the authored
	   markers and rule. 0.5.1 has no focusRing option yet (added in 0.6.3), so
	   hide the built-in layer until the next bump can pass focusRing: false. */
	:global(.canvas .ts-chart__focus-layer--default) {
		display: none;
	}
</style>

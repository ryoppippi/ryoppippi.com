<script lang='ts'>
	import { Chart } from '@tanstack/svelte-charts';
	import { chartDefinition } from './definition.ts';
	import { focusByX, isRowMark } from './focus.ts';

	let { focused = $bindable() }: { focused: number | null } = $props();

	const input = $derived({ focused });
</script>

<Chart
	{input}
	animate={false}
	ariaLabel='申請時点までの通過見込みの推定とccusageのstar数の推移'
	ariaDescription='矢印キーで時点を移動できる。詳しい値は直後の表にも掲載している。'
	aspectRatio={2.2}
	class='canvas'
	focus={focusByX}
	definition={chartDefinition}
	onFocusChange={(point) => {
		// Only some marks are drawn from `rows`; the rest have their own datasets.
		focused = point != null && isRowMark(point.markId) ? point.datumIndex : null;
	}}
/>

<style>
	:global(.canvas) {
		width: 100%;
	}
</style>

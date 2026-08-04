<script lang='ts'>
	import { Chart } from '@tanstack/svelte-charts';
	import { chartDefinition } from './definition.ts';
	import { focusByX, isRowMark } from './focus.ts';

	let { focused = $bindable() }: { focused: number | null } = $props();

	const input = $derived({ focused });
</script>

<!-- focusByX never returns nothing, so the pointer leaving is what clears it. -->
<div onpointerleave={() => (focused = null)}>
	<Chart
		{input}
		animate={false}
		ariaLabel='申請時点までの通過確率の推定とccusageのstar数の推移'
		aspectRatio={2.2}
		class='canvas'
		focus={focusByX}
		definition={chartDefinition}
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

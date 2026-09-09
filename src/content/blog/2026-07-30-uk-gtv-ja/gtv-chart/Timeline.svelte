<script lang="ts">
	import type { ChartHostOptions } from '@tanstack/charts';
	import type { ChartLang } from './copy.ts';
	import { createChartAdapter } from '@tanstack/charts';
	import { onMount, untrack } from 'svelte';
	import { resolveChartLang, uiCopy } from './copy.ts';
	import { buildChartDefinition } from './definition.ts';
	import { isRowMark } from './focus.ts';

	type Props = {
		/** Index of the focused row, or null when nothing is focused. */
		focused: number | null;
		/** Reports focus moving to a row, or clearing with null. */
		onFocusedChange: (focused: number | null) => void;
		lang?: ChartLang;
	};

	let { focused, onFocusedChange, lang: requestedLang }: Props = $props();
	const lang = $derived(resolveChartLang(requestedLang));
	const copy = $derived(uiCopy[lang].chart);
	const ASPECT_RATIO = 2.2;
	const options: ChartHostOptions = $derived({
		definition: buildChartDefinition(focused, lang),
		ariaLabel: copy.ariaLabel,
		ariaDescription: copy.ariaDescription,
		aspectRatio: ASPECT_RATIO,
		idPrefix: 'gtv-timeline',
		onFocusChange: (point) => {
			// Only some marks are drawn from `rows`; the rest have their own datasets.
			onFocusedChange(point != null && isRowMark(point.markId) ? point.datumIndex : null);
		},
	});
	// The adapter takes an initial snapshot; the effect below owns subsequent updates.
	const adapter = createChartAdapter(untrack(() => options));
	const prerendered = adapter.prerender();
	let surface: HTMLDivElement;

	onMount(() => {
		adapter.mount(surface);
		return () => adapter.destroy();
	});
	$effect(() => {
		const next = options;
		untrack(() => adapter.update(next));
	});
</script>

<!-- Pointer leave only clears chart focus. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onpointerleave={() => onFocusedChange(null)}>
	<div
		class="ts-chart-host canvas"
		style:position="relative"
		style:width="100%"
		style:aspect-ratio={ASPECT_RATIO}
	>
		<div bind:this={surface} class="ts-chart-surface" style:width="100%" style:height="100%">
			{@html prerendered}
		</div>
	</div>
</div>

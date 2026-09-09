<script lang="ts">
	import type { ChartLang } from './copy.ts';
	import { onMount } from 'svelte';
	import { localisePoint, resolveChartLang, uiCopy } from './copy.ts';
	import EvidenceTable from './EvidenceTable.svelte';
	import Legend from './Legend.svelte';
	import { describeRow, rows } from './rows.ts';
	import { createScrollReveal } from './scroll-reveal.svelte.ts';
	import Timeline from './Timeline.svelte';
	import './gtv-chart.css';

	let { lang: requestedLang }: { lang?: ChartLang } = $props();
	const lang = $derived(resolveChartLang(requestedLang));
	const copy = $derived(uiCopy[lang]);
	const scrollReveal = createScrollReveal();
	let focused = $state<number | null>(null);
	const readout = $derived(
		focused == null ? '' : describeRow(localisePoint(rows[focused], lang), lang),
	);
	let figure: HTMLElement;

	onMount(() => scrollReveal.attach(figure));
</script>

<figure class="gtv-chart" data-testid="gtv-chart" bind:this={figure}>
	<Legend {lang} />
	<p aria-atomic="true" aria-live="polite" class="readout">{readout || '\u00a0'}</p>
	<div class="wipe" class:revealed={scrollReveal.revealed}>
		<Timeline {focused} {lang} onFocusedChange={(value) => (focused = value)} />
	</div>
	<EvidenceTable {focused} {lang} onFocusedChange={(value) => (focused = value)} />
	<figcaption>{copy.figcaption}</figcaption>
</figure>

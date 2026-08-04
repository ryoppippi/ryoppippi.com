<script lang='ts'>
	import { createScrollReveal } from '../../../lib/scroll-reveal.svelte.ts';
	import EvidenceTable from './EvidenceTable.svelte';
	import Legend from './Legend.svelte';
	import { describeRow, rows } from './rows.ts';
	import Timeline from './Timeline.svelte';

	const scrollReveal = createScrollReveal();

	// Shared between the two halves: hovering the chart highlights the matching
	// table row, and hovering a row marks the point on the chart.
	let focused = $state<number | null>(null);

	// A fixed readout rather than a floating tooltip, which would cover the lines
	// it describes near the right edge.
	const readout = $derived(focused == null ? '' : describeRow(rows[focused]));
</script>

<figure class='gtv-chart' data-testid='gtv-chart' {@attach scrollReveal.attach}>
	<Legend />
	<p aria-live='polite' class='readout'>{readout || '\u00a0'}</p>
	<div class='wipe' class:revealed={scrollReveal.revealed}>
		<Timeline bind:focused />
	</div>
	<EvidenceTable bind:focused />
	<figcaption>
		通過確率はLLMに推定させた値で、実測値ではない。提出書類の構成や審査戦略を示すものでもない。推定方法は冒頭のdetailsを参照。
	</figcaption>
</figure>

<style>
	.gtv-chart {
		--gtv-mid: oklch(55% 0.2 260);
		--gtv-band: oklch(55% 0.2 260);
		--gtv-edge: oklch(55% 0.02 260);
		--gtv-stars: oklch(58% 0.2 25);
		--gtv-surface: white;

		margin-block: 2rem;
	}

	:global(html.dark) .gtv-chart {
		--gtv-mid: oklch(72% 0.16 260);
		--gtv-band: oklch(72% 0.16 260);
		--gtv-edge: oklch(70% 0.02 260);
		--gtv-stars: oklch(70% 0.18 25);
		--gtv-surface: oklch(20% 0.01 260);
	}

	.readout {
		margin: 0 0 0.25rem;
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;
		color: var(--gtv-mid);
	}

	figcaption {
		margin-top: 0.75rem;
		font-size: 0.75rem;
		line-height: 1.6;
		opacity: 0.6;
	}

	/* The chart itself never animates so hover stays instant; the entrance is a
	   plain left-to-right wipe instead. */
	.wipe {
		clip-path: inset(0 100% 0 0);
		transition: clip-path 900ms ease-out;
	}

	.wipe.revealed {
		clip-path: inset(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.wipe {
			transition: none;
		}
	}
</style>

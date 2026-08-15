<script lang='ts'>
	import { resolveChartLang, uiCopy, type ChartLang } from './copy.ts';

	let { lang = 'ja' }: { lang?: ChartLang } = $props();

	const copy = $derived(uiCopy[resolveChartLang(lang)].legend);
</script>

<ul class='legend'>
	<li><span aria-hidden='true' class='swatch swatch--mid'></span>{copy.mid}</li>
	<li><span aria-hidden='true' class='swatch swatch--high'></span>{copy.high}</li>
	<li><span aria-hidden='true' class='swatch swatch--low'></span>{copy.low}</li>
	<li><span aria-hidden='true' class='swatch swatch--stars'></span>{copy.stars}</li>
	<li><span aria-hidden='true' class='swatch swatch--after'></span>{copy.after}</li>
</ul>

<style>
	/* spellchecker:off */
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1rem;
		margin: 0 0 0.75rem;
		padding: 0;
		font-size: 0.8125rem;
		list-style: none;
	}

	.legend li {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin: 0;
	}

	.swatch {
		width: 1.25rem;
		height: 0;
		border-top-width: 2px;
		border-top-style: solid;
	}

	.swatch--mid {
		border-top-color: var(--gtv-mid);
	}

	.swatch--high {
		border-top-style: dashed;
		border-top-color: var(--gtv-edge);
	}

	.swatch--low {
		border-top-style: dotted;
		border-top-color: var(--gtv-edge);
	}

	.swatch--stars {
		border-top-color: var(--gtv-stars);
	}

	.swatch--after {
		border-top-style: dashed;
		border-top-color: var(--gtv-stars);
	}
	/* spellchecker:on */
</style>

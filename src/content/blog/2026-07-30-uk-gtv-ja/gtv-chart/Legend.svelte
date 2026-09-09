<script lang="ts">
	import type { ChartLang } from './copy.ts';
	import { resolveChartLang, uiCopy } from './copy.ts';

	let { lang }: { lang?: ChartLang } = $props();
	const copy = $derived(uiCopy[resolveChartLang(lang)].legend);
</script>

<ul class="legend">
	<li><span aria-hidden="true" class="swatch swatch--mid"></span>{copy.mid}</li>
	<li><span aria-hidden="true" class="swatch swatch--high"></span>{copy.high}</li>
	<li><span aria-hidden="true" class="swatch swatch--low"></span>{copy.low}</li>
	<li><span aria-hidden="true" class="swatch swatch--stars"></span>{copy.stars}</li>
	<li><span aria-hidden="true" class="swatch swatch--after"></span>{copy.after}</li>
</ul>

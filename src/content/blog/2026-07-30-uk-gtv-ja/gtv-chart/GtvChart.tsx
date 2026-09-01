import type { ChartLang } from './copy.ts';
import { createSignal, onSettled } from 'solid-js';
import { localisePoint, resolveChartLang, uiCopy } from './copy.ts';
import EvidenceTable from './EvidenceTable.tsx';
import Legend from './Legend.tsx';
import { describeRow, rows } from './rows.ts';
import { createScrollReveal } from './scroll-reveal.ts';
import Timeline from './Timeline.tsx';
import './gtv-chart.css';

/**
 * The GTV pass-rate timeline: legend, live readout, chart, and evidence table,
 * all sharing one focused row.
 *
 * @param props.lang - Chart language, falling back to Japanese.
 */
export default function GtvChart(props: { lang?: ChartLang }) {
	const lang = () => resolveChartLang(props.lang);
	const copy = () => uiCopy[lang()];
	const scrollReveal = createScrollReveal();

	const [focused, setFocused] = createSignal<number | null>(null);

	const readout = () => {
		const index = focused();
		return index == null ? '' : describeRow(localisePoint(rows[index], lang()), lang());
	};

	let figure!: HTMLElement;
	onSettled(() => scrollReveal.attach(figure));

	return (
		<figure class='gtv-chart' data-testid='gtv-chart' ref={figure}>
			<Legend lang={lang()} />
			<p aria-atomic='true' aria-live='polite' class='readout'>
				{readout() || '\u00a0'}
			</p>
			<div class={{ wipe: true, revealed: scrollReveal.revealed() }}>
				<Timeline focused={focused()} lang={lang()} onFocusedChange={setFocused} />
			</div>
			<EvidenceTable focused={focused()} lang={lang()} onFocusedChange={setFocused} />
			<figcaption>{copy().figcaption}</figcaption>
		</figure>
	);
}

import type { ChartHostOptions } from '@tanstack/charts';
import type { ChartLang } from './copy.ts';
import { createChartAdapter } from '@tanstack/charts';
import { createEffect, onSettled } from 'solid-js';
import { isServer } from '@solidjs/web';
import { resolveChartLang, uiCopy } from './copy.ts';
import { buildChartDefinition } from './definition.ts';
import { isRowMark } from './focus.ts';

type TimelineProps = {
	/** Index of the focused row, or null when nothing is focused. */
	focused: number | null;
	/** Reports focus moving to a row, or clearing with null. */
	onFocusedChange: (focused: number | null) => void;
	lang?: ChartLang;
};

const ASPECT_RATIO = 2.2;

/**
 * Interactive timeline chart, sharing its focus with the evidence table.
 */
export default function Timeline(props: TimelineProps) {
	const lang = () => resolveChartLang(props.lang);
	const copy = () => uiCopy[lang()].chart;
	const definition = () => buildChartDefinition(props.focused, lang());

	const options = (): ChartHostOptions => ({
		definition: definition(),
		ariaLabel: copy().ariaLabel,
		ariaDescription: copy().ariaDescription,
		aspectRatio: ASPECT_RATIO,
		idPrefix: 'gtv-timeline',
		onFocusChange: (point) => {
			// Only some marks are drawn from `rows`; the rest have their own datasets.
			props.onFocusedChange(point != null && isRowMark(point.markId) ? point.datumIndex : null);
		},
	});
	const adapter = createChartAdapter(options());
	let surface!: HTMLDivElement;
	if (!isServer) {
		createEffect(options, (next) => adapter.update(next));
		onSettled(() => {
			adapter.mount(surface);
			return () => adapter.destroy();
		});
	}

	const prerendered = adapter.prerender();

	// Pointer leave only clears chart focus.
	return (
		<div onPointerLeave={() => props.onFocusedChange(null)}>
			<div
				class='ts-chart-host canvas'
				style={{ position: 'relative', width: '100%', 'aspect-ratio': String(ASPECT_RATIO) }}
			>
				<div
					ref={surface}
					class='ts-chart-surface'
					style={{ width: '100%', height: '100%' }}
					innerHTML={prerendered}
				/>
			</div>
		</div>
	);
}

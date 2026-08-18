import type { ChartPoint } from '@tanstack/charts';
import type { ChartProps } from '@tanstack/charts/solid';
import type { Component } from 'solid-js';
import type { ChartLang } from './copy.ts';
import { createChartAdapter } from '@tanstack/charts/adapter';
import { createSignal, Show } from 'solid-js';
import { isServer } from 'solid-js/web';
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

	// `@tanstack/charts/solid` is compiled for the DOM and throws when merely
	// imported on the server, so the server (and the client until the adapter
	// chunk arrives) paints the same SVG through the framework-agnostic
	// adapter, and the interactive chart takes over once loaded.
	const prerendered = () =>
		createChartAdapter({
			definition: definition(),
			ariaLabel: copy().ariaLabel,
			ariaDescription: copy().ariaDescription,
			aspectRatio: ASPECT_RATIO,
			idPrefix: 'gtv-timeline',
		}).prerender();

	const [chart, setChart] = createSignal<Component<ChartProps> | null>(null);
	if (!isServer) {
		void import('@tanstack/charts/solid').then((module) => setChart(() => module.Chart));
	}

	// Pointer leave only clears chart focus.
	return (
		<div onPointerLeave={() => props.onFocusedChange(null)}>
			<Show
				when={chart()}
				keyed
				fallback={
					<div
						class='ts-chart-host canvas'
						style={{ position: 'relative', width: '100%', 'aspect-ratio': String(ASPECT_RATIO) }}
					>
						<div
							class='ts-chart-surface'
							style={{ width: '100%', height: '100%' }}
							innerHTML={prerendered()}
						/>
					</div>
				}
			>
				{(Chart) => (
					<Chart
						ariaLabel={copy().ariaLabel}
						ariaDescription={copy().ariaDescription}
						aspectRatio={ASPECT_RATIO}
						class='canvas'
						definition={definition()}
						onFocusChange={(point: ChartPoint | null) => {
							// Only some marks are drawn from `rows`; the rest have their own datasets.
							props.onFocusedChange(
								point != null && isRowMark(point.markId) ? point.datumIndex : null,
							);
						}}
					/>
				)}
			</Show>
		</div>
	);
}

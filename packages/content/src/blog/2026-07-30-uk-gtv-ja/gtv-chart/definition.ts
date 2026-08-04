import { areaY, d3Curve, defineChart, dot, lineY, rect, ruleX, text } from '@tanstack/charts';
import { scaleLinear, scaleUtc } from 'd3-scale';
import { curveMonotoneX, curveStepAfter } from 'd3-shape';
import { focusByX } from './focus.ts';
import {
	firstAt,
	lastAt,
	rows,
	starsAfterSubmission,
	starsAssessed,
	starTicks,
} from './rows.ts';

const axisDate = new Intl.DateTimeFormat('ja-JP', {
	year: '2-digit',
	month: 'numeric',
	timeZone: 'UTC',
});

/**
 * Builds the timeline chart definition for a given focus state.
 *
 * Since charts 0.3.0 a definition has no external input channel, so the host
 * re-renders by being handed a fresh definition whenever the focus changes.
 *
 * @param focused - Index of the row under the cursor, or null.
 * @returns The chart definition for that focus state.
 */
export function buildChartDefinition(focused: number | null) {
	const focusedAt = focused == null ? null : rows[focused].at;

	return defineChart({
		marks: [
			areaY(rows, {
				id: 'band',
				x: 'at',
				y1: (row) => row.low,
				y2: (row) => row.high,
				fill: 'var(--gtv-band)',
				fillOpacity: focused == null ? 0.14 : 0.05,
				curve: d3Curve(curveStepAfter),
			}),
			lineY(rows, {
				id: 'high',
				x: 'at',
				y: (row) => row.high,
				stroke: 'var(--gtv-edge)',
				strokeWidth: 1,
				strokeOpacity: focused == null ? 1 : 0.35,
				strokeDasharray: '6 4',
				curve: d3Curve(curveStepAfter),
			}),
			lineY(rows, {
				id: 'low',
				x: 'at',
				y: (row) => row.low,
				stroke: 'var(--gtv-edge)',
				strokeWidth: 1,
				strokeOpacity: focused == null ? 1 : 0.35,
				strokeDasharray: '2 4',
				curve: d3Curve(curveStepAfter),
			}),
			// The estimates only moved when new evidence landed, so a step curve is
			// honest about the plateaus between them.
			lineY(rows, {
				id: 'mid',
				x: 'at',
				y: (row) => row.mid,
				stroke: 'var(--gtv-mid)',
				strokeWidth: 2.5,
				curve: d3Curve(curveStepAfter),
			}),
			lineY(starsAssessed, {
				id: 'stars',
				x: 'at',
				y: (point) => point.percent,
				stroke: 'var(--gtv-stars)',
				strokeWidth: 2.5,
				curve: d3Curve(curveMonotoneX),
			}),
			// Stars gained after submission were never part of the assessment.
			lineY(starsAfterSubmission, {
				id: 'stars-after',
				x: 'at',
				y: (point) => point.percent,
				stroke: 'var(--gtv-stars)',
				strokeWidth: 2.5,
				strokeDasharray: '5 4',
				curve: d3Curve(curveMonotoneX),
			}),
			// A dot per estimate, so each step is visibly its own data point.
			dot(rows, {
				id: 'mid-point',
				x: 'at',
				y: 'mid',
				r: 2.5,
				fill: 'var(--gtv-mid)',
			}),
			// Everything after the focused moment recedes: at that point in the story
			// it had not happened yet.
			// Both marks stay in the scene and hide with opacity: dropping their data
			// leaves the previous nodes on screen once focus clears.
			rect([focusedAt ?? lastAt], {
				id: 'future-veil',
				x1: (at) => at,
				x2: () => lastAt,
				y1: () => 0,
				y2: () => 100,
				fill: 'var(--gtv-surface)',
				fillOpacity: focusedAt == null ? 0 : 0.62,
			}),
			ruleX([focusedAt ?? firstAt], {
				id: 'focus-rule',
				stroke: 'var(--gtv-mid)',
				strokeWidth: 1,
				strokeOpacity: focusedAt == null ? 0 : 1,
				strokeDasharray: '3 3',
			}),
			dot(rows, {
				id: 'mid-marker',
				x: 'at',
				y: (row) => row.mid,
				r: (_row, index) => (index === focused ? 6.5 : 0),
				fill: 'var(--gtv-mid)',
				stroke: 'var(--gtv-surface)',
				strokeWidth: 2,
			}),
			dot(rows, {
				id: 'stars-marker',
				x: 'at',
				y: (row) => row.starsPercent,
				r: (_row, index) => (index === focused ? 6.5 : 0),
				fill: 'var(--gtv-stars)',
				stroke: 'var(--gtv-surface)',
				strokeWidth: 2,
			}),
			// Stand-in for a second y axis.
			text(starTicks, {
				id: 'stars-axis',
				x: () => lastAt,
				y: 'percent',
				text: (tick) => `${tick.stars}K`,
				fill: 'var(--gtv-stars)',
				fontSize: 11,
				anchor: 'start',
				dx: 10,
			}),
		],
		x: {
			// A factory, not a configured instance: charts 0.5.1 drops a configured
			// domain on date-valued axes (fixed upstream in 0.6.4). The inferred
			// domain equals [firstAt, lastAt] because those are the data's ends.
			scale: scaleUtc,
			grid: false,
			axis: {
				ticks: {
					count: 6,
					format: (value: Date) => axisDate.format(value),
				},
			},
		},
		y: {
			scale: scaleLinear().domain([0, 100]),
			grid: true,
			axis: {
				ticks: {
					count: 5,
					format: (value: number) => `${value}%`,
				},
			},
		},
		clip: false,
		margin: { top: 16, right: 52, bottom: 32, left: 44 },
		focus: focusByX,
		animate: false,
	});
}

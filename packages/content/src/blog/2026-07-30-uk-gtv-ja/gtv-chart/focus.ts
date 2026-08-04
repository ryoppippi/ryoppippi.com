import type { ChartFocusStrategy } from '@tanstack/charts';
import type { Row, StarPoint } from './rows.ts';

/** Marks whose `datumIndex` is an index into the row list. */
const ROW_MARKS = new Set([
	'band',
	'low',
	'mid',
	'high',
	'mid-point',
	'mid-marker',
	'stars-marker',
]);

/**
 * Reports whether a focused point maps onto a table row.
 *
 * @param markId - Id of the mark the point belongs to.
 * @returns True when `datumIndex` indexes `rows`.
 */
export function isRowMark(markId: string): boolean {
	return ROW_MARKS.has(markId);
}

/**
 * Focuses by x position alone, so moving anywhere over the plot follows the
 * timeline instead of requiring the cursor to be near a line.
 */
export const focusByX: ChartFocusStrategy<Row | StarPoint> = {
	resolve: (points, x) => {
		const candidates = points.filter((point) => isRowMark(point.markId));
		if (candidates.length === 0) {
			return [];
		}

		const nearest = candidates.reduce((best, point) =>
			Math.abs(point.x - x) < Math.abs(best.x - x) ? point : best,
		);

		return candidates.filter((point) => point.x === nearest.x);
	},
};

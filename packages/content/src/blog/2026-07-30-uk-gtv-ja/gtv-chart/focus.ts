import type { ChartFocusStrategy, ChartPoint } from '@tanstack/charts';
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

type GtvPoint = ChartPoint<Row | StarPoint>;

/**
 * Collects the row-mark points belonging to the row nearest an x position.
 *
 * @param points - Every point in the rendered scene.
 * @param x - Scene x coordinate to resolve against.
 * @returns The row-mark points at the nearest row, or an empty list.
 */
function rowPointsNearestX(
	points: readonly GtvPoint[],
	x: number,
): readonly GtvPoint[] {
	const candidates = points.filter((point) => isRowMark(point.markId));
	if (candidates.length === 0) {
		return [];
	}

	const nearest = candidates.reduce((best, point) =>
		Math.abs(point.x - x) < Math.abs(best.x - x) ? point : best,
	);

	return candidates.filter((point) => point.x === nearest.x);
}

/**
 * Focuses by x position alone, so moving anywhere over the plot follows the
 * timeline instead of requiring the cursor to be near a line.
 */
export const focusByX: ChartFocusStrategy<Row | StarPoint> = {
	// maxDistance is ignored on purpose: the whole plot tracks the timeline.
	resolve: (points, x) => rowPointsNearestX(points, x),
	group: (points, point) => rowPointsNearestX(points, point.x),
	// One stop per row: keyboard navigation steps through the mid-line dots.
	navigation: (points) =>
		points
			.filter((point) => point.markId === 'mid-point')
			.toSorted((a, b) => a.x - b.x),
};

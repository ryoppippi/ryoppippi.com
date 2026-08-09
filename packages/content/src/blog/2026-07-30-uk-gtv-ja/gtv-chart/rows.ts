import type { GtvPoint } from './data.ts';
import {
	CREATED_AT,
	GTV_POINTS,
	STAR_SAMPLES,
	STARS_AXIS_MAX,
	STARS_AXIS_TICKS,
	SUBMITTED_AT,
} from './data.ts';

export const SERIES = { low: '低め', mid: '中央', high: '高め', stars: 'ccusage stars' } as const;

export type Series = keyof typeof SERIES;

export type StarPoint = {
	at: Date;
	stars: number;
	/** Stars projected onto the percentage scale the chart draws. */
	percent: number;
};

export type Row = GtvPoint & {
	at: Date;
	/** Stars in thousands, interpolated from the history. Null before ccusage. */
	stars: number | null;
	starsPercent: number | null;
};

const createdAt = new Date(CREATED_AT);
const submittedAt = new Date(SUBMITTED_AT);
const toPercent = (thousands: number) => (thousands / STARS_AXIS_MAX) * 100;

const starPoints: StarPoint[] = STAR_SAMPLES.map(({ stars, date }) => ({
	at: new Date(date),
	stars,
	percent: toPercent(stars / 1000),
}));

/** Interpolates the star count at an arbitrary moment, in thousands. */
function starsAt(at: Date): number | null {
	if (at < createdAt) {
		return null;
	}

	const first = starPoints[0];
	if (at <= first.at) {
		return 0;
	}

	const nextIndex = starPoints.findIndex((point) => point.at >= at);
	if (nextIndex < 0) {
		return starPoints[starPoints.length - 1].stars / 1000;
	}

	const before = starPoints[nextIndex - 1];
	const after = starPoints[nextIndex];
	const span = after.at.getTime() - before.at.getTime();
	const ratio = span === 0 ? 0 : (at.getTime() - before.at.getTime()) / span;
	const stars = before.stars + (after.stars - before.stars) * ratio;

	return Math.round(stars / 100) / 10;
}

export const rows: Row[] = GTV_POINTS.map((point) => {
	const at = new Date(point.date);
	const stars = starsAt(at);

	return {
		...point,
		at,
		stars,
		starsPercent: stars == null ? null : toPercent(stars),
	};
});

export const firstAt = rows[0].at;
export const lastAt = rows[rows.length - 1].at;

export const starTicks = STARS_AXIS_TICKS.map((stars) => ({
	stars,
	percent: toPercent(stars),
}));

/**
 * Summarises a row for the readout beside the chart.
 *
 * @param row - The focused row.
 * @returns The milestone, the middle estimate while one exists, and the stars.
 */
export function describeRow(row: Row): string {
	const parts = [`${row.label} ${row.milestone}`];
	if (row.mid != null) {
		parts.push(`${SERIES.mid} ${row.mid}%`);
	}
	if (row.stars != null) {
		parts.push(`${SERIES.stars} ~${row.stars}K`);
	}

	return parts.join(' · ');
}

/**
 * The star count at submission, interpolated between the surrounding samples.
 *
 * Sampling lands on round star counts, not on dates, so the nearest sample can
 * be days off. Splitting the series there would draw stars that were assessed
 * as if they had arrived afterwards.
 */
const submittedPoint: StarPoint = (() => {
	const stars = Math.round((starsAt(submittedAt) ?? 0) * 1000);

	return { at: submittedAt, stars, percent: toPercent(stars / 1000) };
})();

/** Star history up to submission: what the application was actually assessed on. */
export const starsAssessed = [
	...starPoints.filter((point) => point.at < submittedAt),
	submittedPoint,
];

/** Star history after submission, sharing a point so the two lines meet. */
export const starsAfterSubmission = [
	submittedPoint,
	...starPoints.filter((point) => point.at > submittedAt),
];

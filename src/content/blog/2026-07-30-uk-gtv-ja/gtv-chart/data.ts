import starHistory from './star-history.json';
import timeline from './timeline.json';

/**
 * A point on the timeline: the estimated probability of passing at that moment,
 * plus the public evidence that moved it. The estimates are LLM guesses, not
 * measurements.
 */
export type GtvPoint = {
	/** Rows covering a range (`'25/6-7`) are pinned to a date inside it. */
	date: string;
	/** Period label shown in the table's first column. */
	label: string;
	/** What happened at this point. */
	milestone: string;
	/** Low estimate, in percent. Null once the estimate is frozen. */
	low: number | null;
	/** Middle estimate, in percent. Null once the estimate is frozen. */
	mid: number | null;
	/** High estimate, in percent. Null once the estimate is frozen. */
	high: number | null;
	/** Note on what moved the estimate at this point. */
	evidence: string;
	/** Phrases inside `evidence` to turn into links. */
	links?: readonly { text: string; href: string }[];
	/** Link for the milestone itself. */
	milestoneHref?: string;
};

/** A point on ccusage's star history: when the count reached `stars`. */
export type StarSample = {
	stars: number;
	date: string;
};

export const GTV_POINTS: readonly GtvPoint[] = timeline;

export const STAR_SAMPLES: readonly StarSample[] = starHistory.samples;

/** ccusage's repository was created here, so stars start from zero. */
export const CREATED_AT = starHistory.createdAt;

/** The application was submitted here; later stars were not assessed. */
export const SUBMITTED_AT = starHistory.submittedAt;

/** Upper bound of the stars axis, in thousands: what 100% maps to. */
export const STARS_AXIS_MAX = starHistory.axisMaxK;

/** Ticks rendered along the right-hand stars axis, in thousands. */
export const STARS_AXIS_TICKS: readonly number[] = starHistory.axisTicksK;

import type { GtvPoint } from './data.ts';

export type Segment = { text: string; href?: string };

/**
 * Splits a note into plain text and the phrases that should link out.
 *
 * @param point - The timeline point whose note is being rendered.
 * @returns Segments in order, each either plain text or a link.
 */
export function segments(point: GtvPoint): Segment[] {
	const parts: Segment[] = [];
	let rest = point.evidence;

	for (const link of point.links ?? []) {
		const index = rest.indexOf(link.text);
		if (index < 0) {
			continue;
		}

		if (index > 0) {
			parts.push({ text: rest.slice(0, index) });
		}
		parts.push(link);
		rest = rest.slice(index + link.text.length);
	}

	if (rest.length > 0) {
		parts.push({ text: rest });
	}

	return parts;
}

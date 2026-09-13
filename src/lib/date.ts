const formatter = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
});

/**
 * Formats a publication date for visible site metadata.
 *
 * @param date - Date to format.
 * @returns A day-month-year date such as `2 Jan 2024`.
 */
export function formatDate(date: Date): string {
	return formatter.format(date);
}

/**
 * Formats a date as the ISO 8601 calendar date of its local day.
 *
 * Built from the local getters on purpose: `toISOString()` reports the UTC
 * day, which in Japan is still the previous day until 09:00.
 *
 * @param date - Date to format.
 * @returns A `yyyy-MM-dd` string such as `2026-01-05`.
 * @example
 * formatLocalIsoDate(new Date(2026, 0, 5)); // '2026-01-05'
 */
export function formatLocalIsoDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

if (import.meta.vitest != null) {
	// Node re-reads TZ on assignment, so stubbing it pins the local zone
	// regardless of the developer machine or the CI runner.
	beforeEach(() => vi.stubEnv('TZ', 'Asia/Tokyo'));
	afterEach(() => vi.unstubAllEnvs());

	test.each([
		{
			name: 'pads a single-digit month and day',
			instant: '2026-01-05T12:00:00+09:00',
			expected: '2026-01-05',
		},
		{
			name: 'keeps two-digit fields unchanged',
			instant: '2026-12-25T12:00:00+09:00',
			expected: '2026-12-25',
		},
		{
			// The UTC day is still 31 December here; only local getters report the new year.
			name: 'stays on the local day just after midnight',
			instant: '2026-01-01T00:00:01+09:00',
			expected: '2026-01-01',
		},
	] as const)('formatLocalIsoDate $name', ({ instant, expected }) => {
		expect(formatLocalIsoDate(new Date(instant))).toBe(expected);
	});
}

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

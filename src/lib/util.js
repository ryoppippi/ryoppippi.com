import { format } from 'date-fns';

/**
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
	return format(date, 'dd MMM Y');
}

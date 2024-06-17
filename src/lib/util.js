import { format } from 'date-fns';

/**
 * @param {Date} date
 */
export function formatDate(date) {
	return format(date, 'dd MMM y');
}

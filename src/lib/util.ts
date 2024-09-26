import * as ufo from 'ufo';
import { format } from 'date-fns';

/**
 * @param {Date} date
 */
export function formatDate(date: Date): string {
	return format(date, 'dd MMM y');
}

export function domain(): string {
	// eslint-disable-next-line node/prefer-global/process
	const domain = ufo.parseURL(process.env.DOMAIN).host;
	return domain as string;
}

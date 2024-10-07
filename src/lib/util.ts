import * as ufo from 'ufo';
import { format } from 'date-fns';
import { assets } from '$app/paths';

/**
 * @param {Date} date
 */
export function formatDate(date: Date) {
	return format(date, 'dd MMM y');
}

export function domain() {
	return assets;
}

export function subdomain(...paths: string[]) {
	return ufo.joinURL(domain(), ...paths);
}

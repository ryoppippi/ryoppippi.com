import * as ufo from 'ufo';
import { format } from 'date-fns';
import { assets } from '$app/paths';

/**
 * @param {Date} date
 */
export function formatDate(date) {
	return format(date, 'dd MMM y');
}

export function domain() {
	return assets;
}

/**
 * @param {string[]} paths
 */
export function subdomain(...paths) {
	return ufo.joinURL(domain(), ...paths);
}

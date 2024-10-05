import * as ufo from 'ufo';
import { format } from 'date-fns';

/**
 * @param {Date} date
 */
export function formatDate(date) {
	return format(date, 'dd MMM y');
}

export function domain() {
	// eslint-disable-next-line node/prefer-global/process
	const { host } = (ufo.parseURL(process.env.DOMAIN));
	if (host == null) {
		throw new Error('Missing domain');
	}
	return host;
}

/**
 * @param {string[]} paths
 */
export function subdomain(...paths) {
	return ufo.joinURL(
		// @ts-expect-error undefined
		// eslint-disable-next-line node/prefer-global/process
		/** @as{string} */(process.env.DOMAIN),
		...paths,
	);
}

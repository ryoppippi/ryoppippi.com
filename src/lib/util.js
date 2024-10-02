import * as ufo from 'ufo';
import { format } from 'date-fns';
import GithubSlugger from 'github-slugger';

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

const slugger = new GithubSlugger();

/**
 * @param {string} s
 */
export function slugify(s) {
	return slugger.slug(s);
}

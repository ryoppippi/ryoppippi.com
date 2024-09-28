import * as ufo from 'ufo';
import { format } from 'date-fns';
import GithubSlugger from 'github-slugger';

/**
 * @param {Date} date
 */
export function formatDate(date: Date): string {
	return format(date, 'dd MMM y');
}

export function domain(): string {
	// eslint-disable-next-line node/prefer-global/process
	return ufo.parseURL(process.env.DOMAIN).host as string;
}

export function subdomain(...paths: string[]): string {
	// eslint-disable-next-line node/prefer-global/process
	return ufo.joinURL(process.env.DOMAIN as string, ...paths);
}

export const slugger = new GithubSlugger();

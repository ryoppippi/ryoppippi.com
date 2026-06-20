import type { RequestHandler } from './$types';
import { extractInstallSection, fetchDotfilesReadme } from '$lib/dotfiles';
import { error } from '@sveltejs/kit';

export const prerender = true;

/**
 * Linux-only install instructions from the dotfiles README.
 *
 * Read with `curl https://ryoppippi.com/dotfiles/linux`.
 */
export const GET: RequestHandler = async ({ fetch }) => {
	try {
		const readme = await fetchDotfilesReadme(fetch);
		const install = extractInstallSection(readme, 'Linux');

		return new Response(install, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
			},
		});
	}
	catch (e) {
		console.error(e);
		error(502, 'Failed to build dotfiles Linux install section');
	}
};

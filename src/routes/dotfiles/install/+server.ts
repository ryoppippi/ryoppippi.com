import type { RequestHandler } from './$types';
import { extractSection, fetchDotfilesReadme } from '$lib/dotfiles';
import { error } from '@sveltejs/kit';

export const prerender = true;

/**
 * Full install instructions (all operating systems) from the dotfiles README.
 *
 * Read with `curl https://ryoppippi.com/dotfiles/install`.
 */
export const GET = (async ({ fetch }) => {
	try {
		const readme = await fetchDotfilesReadme(fetch);
		const install = extractSection(readme, 'Initial Setup');

		return new Response(install, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
			},
		});
	}
	catch (e) {
		console.error(e);
		error(502, 'Failed to build dotfiles install section');
	}
}) satisfies RequestHandler;

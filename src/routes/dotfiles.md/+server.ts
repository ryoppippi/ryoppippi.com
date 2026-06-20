import type { RequestHandler } from './$types';
import { fetchDotfilesReadme } from '$lib/dotfiles';
import { error } from '@sveltejs/kit';

export const prerender = true;

/**
 * Raw README of the dotfiles repository.
 *
 * Browsers are redirected to GitHub by the `/dotfiles` rule in `routes.ts`;
 * CLI clients can read the markdown directly via
 * `curl https://ryoppippi.com/dotfiles.md`.
 */
export const GET = (async ({ fetch }) => {
	try {
		const raw = await fetchDotfilesReadme(fetch);

		return new Response(raw, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
			},
		});
	}
	catch (e) {
		console.error(e);
		error(502, 'Failed to fetch dotfiles README');
	}
}) satisfies RequestHandler;

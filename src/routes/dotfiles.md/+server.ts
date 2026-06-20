import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

export const prerender = true;

/**
 * Raw README of the dotfiles repository.
 *
 * The README lives in a separate repository, so it is fetched at prerender
 * time and emitted as a static `dotfiles.md` asset. Browsers are redirected to
 * GitHub by the `/dotfiles` rule in `routes.ts`; CLI clients can read the
 * markdown directly via `curl https://ryoppippi.com/dotfiles.md`.
 */
const README_URL = 'https://raw.githubusercontent.com/ryoppippi/dotfiles/main/README.md';

export const GET: RequestHandler = async ({ fetch }) => {
	const res = await fetch(README_URL);

	if (!res.ok) {
		error(res.status, 'Failed to fetch dotfiles README');
	}

	const raw = await res.text();

	return new Response(raw, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
};

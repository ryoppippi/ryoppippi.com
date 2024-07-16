import type { Handle } from '@sveltejs/kit';
import faviconLinks from '$lib/assets/favicons.html?raw';

/** head に favicon を追加する */
export const meta = (async ({ event, resolve }) => {
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('</head>', `${faviconLinks}</head>`),
	});
	return response;
}) satisfies Handle;

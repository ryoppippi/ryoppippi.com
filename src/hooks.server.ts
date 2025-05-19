import type { Handle } from '@sveltejs/kit';

// TODO: check out assets preloading https://svelte.dev/docs/kit/hooks
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		preload: ({ type }) => (['js', 'css', 'font'].includes(type)),
	});
	return response;
};

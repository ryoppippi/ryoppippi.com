import type { PageServerLoad } from './$types';

export const load = (() => {
	return {
		title: 'sponsors',
	};
}) satisfies PageServerLoad;

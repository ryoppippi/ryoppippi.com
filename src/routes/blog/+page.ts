import { posts } from '$lib/api' with { type: 'macro' };
export const load = () => {
	return {
		posts: posts
	};
};

import { posts as macroPosts } from '$lib/api' with { type: 'macro' };

export function load() {
	return {
		posts: macroPosts,
	};
}

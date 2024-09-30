import { error } from '@sveltejs/kit';
import { getPost } from '$contents/blog/index.js';

export async function load({ params: { slug } }) {
	try {
		return await getPost(slug as string);
	}
	catch (e) {
		console.error(e);
		return error(404, 'Post not found');
	}
}

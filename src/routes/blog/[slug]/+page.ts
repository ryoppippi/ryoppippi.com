import { parse } from 'date-fns';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	try {
		const post = await import(`../../../posts/${params.slug}.md`);

		return {
			content: post.default,
			meta: {
				slug: params.slug,
				title: post.metadata.title,
				pubDate: parse(post.metadata.date, 'yyyy-MM-dd', new Date()).toJSON()
			}
		};
	} catch (e) {
		console.error(e);
		error(404, 'Post not found');
	}
}

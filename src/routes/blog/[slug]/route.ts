import type { DevFileRouteModule } from '@/dev-server/route-types.ts';
import { createArticlePageFiles } from '@/pages/blog/article';
import { createErrorPageFile } from '@/pages/error';
import { createDevRouteResponse, HTML_CONTENT_TYPE } from '@/dev-server/route-types.ts';

export const entries: DevFileRouteModule['entries'] = ({ posts }) =>
	posts.map(({ filename }) => ({ slug: filename }));

export const render: DevFileRouteModule['render'] = async ({ dependencies, params }) => {
	const post = await dependencies.loadBlogPost(params.slug);
	if (post == null) {
		return createDevRouteResponse(
			createErrorPageFile(dependencies.assets).content,
			HTML_CONTENT_TYPE,
			404,
		);
	}
	return createDevRouteResponse(createArticlePageFiles(post, dependencies.assets)[0].content);
};

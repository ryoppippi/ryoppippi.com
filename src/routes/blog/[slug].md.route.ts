import type { DevFileRouteModule } from '@/dev-server/route-types.ts';
import { createDevRouteResponse, MARKDOWN_CONTENT_TYPE } from '@/dev-server/route-types.ts';

export const entries: DevFileRouteModule['entries'] = ({ posts }) =>
	posts.map(({ filename }) => ({ slug: filename }));

export const render: DevFileRouteModule['render'] = async ({ dependencies, params }) => {
	const source = await dependencies.loadBlogPostSource(params.slug);
	return source == null ? null : createDevRouteResponse(source, MARKDOWN_CONTENT_TYPE);
};

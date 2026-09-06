import type { DevFileRouteModule } from '@/dev-server/route-types.ts';
import { postListItems } from '@/contents/external-content.ts';
import { createBlogListPageFile } from '@/pages/blog';
import { createDevRouteResponse } from '@/dev-server/route-types.ts';

export const render: DevFileRouteModule['render'] = async ({ dependencies }) => {
	const [posts, externalPosts] = await Promise.all([
		dependencies.loadBlogPostMetadata(),
		dependencies.loadExternalPosts(),
	]);
	return createDevRouteResponse(
		createBlogListPageFile(
			[...externalPosts, ...postListItems(posts, { includeDrafts: true })],
			dependencies.assets,
		).content,
	);
};

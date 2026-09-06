import type { DevFileRouteModule } from '@/dev-server/route-types.ts';
import { renderMediaFeed } from '@/generation/feeds.ts';
import { createDevRouteResponse } from '@/dev-server/route-types.ts';

export const render: DevFileRouteModule['render'] = async ({ dependencies }) => {
	const feed = await renderMediaFeed(await dependencies.loadExternalMedia());
	return createDevRouteResponse(feed.content, feed.contentType);
};

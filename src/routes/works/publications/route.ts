import type { DevFileRouteModule } from '@/dev-server/route-types.ts';
import { createPublicationsPageFile } from '@/pages/works/publications';
import { createDevRouteResponse } from '@/dev-server/route-types.ts';

export const render: DevFileRouteModule['render'] = async ({ dependencies }) =>
	createDevRouteResponse(
		createPublicationsPageFile(await dependencies.loadPublications(), dependencies.assets).content,
	);

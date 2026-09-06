import type { DevFileRouteModule } from '@/dev-server/route-types.ts';
import { createMediaPageFile } from '@/pages/works/media';
import { createDevRouteResponse } from '@/dev-server/route-types.ts';

export const render: DevFileRouteModule['render'] = async ({ dependencies }) =>
	createDevRouteResponse(
		createMediaPageFile(await dependencies.loadExternalMedia(), dependencies.assets).content,
	);

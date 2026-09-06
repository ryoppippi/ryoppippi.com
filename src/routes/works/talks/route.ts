import type { DevFileRouteModule } from '@/dev-server/route-types.ts';
import { createTalksPageFile } from '@/pages/works/talks';
import { createDevRouteResponse } from '@/dev-server/route-types.ts';

export const render: DevFileRouteModule['render'] = async ({ dependencies }) =>
	createDevRouteResponse(
		createTalksPageFile(await dependencies.loadTalks(), dependencies.assets).content,
	);

import type { DevFileRouteModule } from '@/dev-server/route-types.ts';
import { createHomePageFile } from '@/pages/home';
import { createDevRouteResponse } from '@/dev-server/route-types.ts';

export const render: DevFileRouteModule['render'] = async ({ dependencies }) =>
	createDevRouteResponse(createHomePageFile(dependencies.assets).content);

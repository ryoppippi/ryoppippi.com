import type { DevFileRouteModule } from '@/dev-server/route-types.ts';
import { createSponsorsPageFile } from '@/pages/sponsors';
import { createDevRouteResponse } from '@/dev-server/route-types.ts';

export const render: DevFileRouteModule['render'] = async ({ dependencies }) =>
	createDevRouteResponse(createSponsorsPageFile(dependencies.assets).content);

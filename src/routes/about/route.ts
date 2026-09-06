import type { DevFileRouteModule } from '@/dev-server/route-types.ts';
import { createAboutPageFile } from '@/pages/about';
import { createDevRouteResponse } from '@/dev-server/route-types.ts';

export const render: DevFileRouteModule['render'] = async ({ dependencies }) =>
	createDevRouteResponse(createAboutPageFile(dependencies.assets).content);

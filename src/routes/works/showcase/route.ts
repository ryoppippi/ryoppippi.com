import type { DevFileRouteModule } from '@/dev-server/route-types.ts';
import { createShowcasePageFile } from '@/pages/works/showcase';
import { createDevRouteResponse } from '@/dev-server/route-types.ts';

export const render: DevFileRouteModule['render'] = async ({ dependencies }) =>
	createDevRouteResponse(
		createShowcasePageFile(await dependencies.loadShowcase(), dependencies.assets).content,
	);

import type { DevFileRouteModule } from '@/dev-server/route-types.ts';
import { createOssPageFile } from '@/pages/works/oss';
import { createDevRouteResponse } from '@/dev-server/route-types.ts';

export const render: DevFileRouteModule['render'] = async ({ dependencies }) =>
	createDevRouteResponse(
		createOssPageFile(await dependencies.loadOssProjects(), dependencies.assets).content,
	);

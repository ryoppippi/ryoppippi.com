import type { DevFileRouteModule } from '@/dev-server/route-types.ts';
import { createDevRouteResponse, MARKDOWN_CONTENT_TYPE } from '@/dev-server/route-types.ts';

export const render: DevFileRouteModule['render'] = async ({ dependencies }) =>
	createDevRouteResponse(await dependencies.loadDotfiles(), MARKDOWN_CONTENT_TYPE);

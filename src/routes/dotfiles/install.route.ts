import type { DevFileRouteModule } from '@/dev-server/route-types.ts';
import { createDevRouteResponse, TEXT_CONTENT_TYPE } from '@/dev-server/route-types.ts';
import { extractSection } from '@/lib/dotfiles.ts';

export const render: DevFileRouteModule['render'] = async ({ dependencies }) =>
	createDevRouteResponse(
		extractSection(await dependencies.loadDotfiles(), 'Setup'),
		TEXT_CONTENT_TYPE,
	);

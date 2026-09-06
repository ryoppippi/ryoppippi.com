import type { DevFileRouteModule } from '@/dev-server/route-types.ts';
import { createDevRouteResponse } from '@/dev-server/route-types.ts';
import { extractInstallSection } from '@/lib/dotfiles.ts';

const platforms = [
	{ os: 'mac', heading: 'macOS' },
	{ os: 'linux', heading: 'Linux' },
] as const;

export const entries: DevFileRouteModule['entries'] = () => platforms.map(({ os }) => ({ os }));

export const render: DevFileRouteModule['render'] = async ({ dependencies, params }) => {
	const platform = platforms.find(({ os }) => os === params.os);
	if (platform == null) {
		return null;
	}
	return createDevRouteResponse(
		extractInstallSection(await dependencies.loadDotfiles(), platform.heading),
	);
};

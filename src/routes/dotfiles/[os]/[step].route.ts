import type { DevFileRouteModule } from '@/dev-server/route-types.ts';
import { createDevRouteResponse, TEXT_CONTENT_TYPE } from '@/dev-server/route-types.ts';
import { extractInstallSection, parseStepCommands } from '@/lib/dotfiles.ts';

const platforms = [
	{ os: 'mac', heading: 'macOS' },
	{ os: 'linux', heading: 'Linux' },
] as const;

export const entries: DevFileRouteModule['entries'] = ({ dotfiles }) =>
	platforms.flatMap(({ os, heading }) =>
		parseStepCommands(extractInstallSection(dotfiles, heading)).map(({ step }) => ({
			os,
			step: String(step),
		})),
	);

export const render: DevFileRouteModule['render'] = async ({ dependencies, params }) => {
	const platform = platforms.find(({ os }) => os === params.os);
	if (platform == null) {
		return null;
	}
	const section = extractInstallSection(await dependencies.loadDotfiles(), platform.heading);
	const command = parseStepCommands(section).find(
		({ step }) => String(step) === params.step,
	)?.command;
	return command == null ? null : createDevRouteResponse(command, TEXT_CONTENT_TYPE);
};

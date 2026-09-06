import type { GeneratedFile } from '@/generation/generated-file.ts';
import { extractInstallSection, extractSection, parseStepCommands } from '@/lib/dotfiles.ts';
import type { PageRoutes } from '../route.ts';

/** Installation endpoints derived once from the README for both hosts. */
export const routes = (({ dotfiles }) =>
	createDotfilesPageFiles(dotfiles).map((file) => ({
		path: `/${file.path}`,
		render: async () => file,
	}))) satisfies PageRoutes;

/**
 * Creates the dotfiles README and installation-command endpoints.
 *
 * @param readme - Source README loaded by the host.
 * @returns Site-specific dotfiles outputs.
 */
export function createDotfilesPageFiles(readme: string): GeneratedFile[] {
	const osSections = [
		['mac', 'macOS'],
		['linux', 'Linux'],
	] as const;
	return [
		{ path: 'dotfiles.md', content: readme },
		{ path: 'dotfiles/install', content: extractSection(readme, 'Setup') },
		...osSections.flatMap(([slug, heading]) => {
			const section = extractInstallSection(readme, heading);
			return [
				{
					path: `dotfiles/${slug}.html`,
					content: section,
					contentType: 'text/plain; charset=utf-8',
				},
				...parseStepCommands(section).map(({ step, command }) => ({
					path: `dotfiles/${slug}/${step}`,
					content: command,
				})),
			];
		}),
	];
}

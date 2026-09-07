import type { OxContentCustomHostRenderResult } from '@ox-content/vite-plugin/custom-host';
import { extractInstallSection, extractSection, parseStepCommands } from './data.ts';
import type { PageRoutes } from '@/utils/ssg/route.ts';

/** Installation endpoints derived once from the README for both hosts. */
export const routes = (({ dotfiles }) =>
	createDotfilesPageFiles(dotfiles).map((file) => ({
		path: `/${file.outputPath}`,
		render: async () => file,
	}))) satisfies PageRoutes;

/**
 * Creates the dotfiles README and installation-command endpoints.
 *
 * @param readme - Source README loaded by the host.
 * @returns Site-specific dotfiles outputs.
 */
export function createDotfilesPageFiles(readme: string) {
	const osSections = [
		['mac', 'macOS'],
		['linux', 'Linux'],
	] as const;
	return [
		{ outputPath: 'dotfiles.md', body: readme, contentType: 'text/markdown; charset=utf-8' },
		{
			outputPath: 'dotfiles/install',
			body: extractSection(readme, 'Setup'),
			contentType: 'text/plain; charset=utf-8',
		},
		...osSections.flatMap(([slug, heading]) => {
			const section = extractInstallSection(readme, heading);
			return [
				{
					outputPath: `dotfiles/${slug}.html`,
					body: section,
					contentType: 'text/plain; charset=utf-8',
				},
				...parseStepCommands(section).map(({ step, command }) => ({
					outputPath: `dotfiles/${slug}/${step}`,
					body: command,
					contentType: 'text/plain; charset=utf-8',
				})),
			];
		}),
	] satisfies OxContentCustomHostRenderResult[];
}

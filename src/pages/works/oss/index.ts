import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import { definePage } from '@/components/SiteLayout/page.ts';
import { loadOssProjects, type OssProject } from './data.ts';
import Oss from './Oss.tsx';
import type { PageRoutes } from '@/utils/ssg/route.ts';

/** OSS endpoint shared by dev and SSG. */
export const routes = (() => [
	{
		path: '/works/oss/',
		render: async ({ root, assets }) => createOssPageFile(await loadOssProjects(root), assets),
	},
]) satisfies PageRoutes;

/**
 * Renders the open-source projects page.
 *
 * @param projects - Manually ordered OSS projects to render.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated open-source projects page.
 */
export function createOssPageFile(projects: OssProject[], assets: SiteAssets) {
	return definePage({
		component: Oss,
		componentProps: { projects },
		outputPath: 'works/oss/index.html',
		sourcePaths: [
			'src/pages/works/oss/data.ts',
			'src/components/WorksNav',
			'src/components/WorksSection',
			'src/components/WorksNav/WorksProse.css',
			'src/pages/works/oss',
			'src/content/works/oss/list.json',
			'src/content/works/oss/stars.json',
		],
		title: 'open-source projects',
		pathname: '/works/oss/',
		description:
			'Open-source projects by @ryoppippi across AI tools, Nix, TypeScript, Svelte, Vim, Zig, and shell configuration.',
		assets,
		pageModule: '/src/pages/works/oss/Oss.tsx',
		style: 'works/oss',
	});
}

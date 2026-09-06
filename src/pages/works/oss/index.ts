import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import { definePage } from '@/pages/page.ts';
import type { OssProject } from './data.ts';
import OssPage from './page.tsx';
import type { PageRoutes } from '../../route.ts';

/** OSS endpoint shared by dev and SSG. */
export const routes = (() => [
	{
		path: '/works/oss/',
		render: async ({ assets, loadOssProjects }) =>
			createOssPageFile(await loadOssProjects(), assets),
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
		component: OssPage,
		componentProps: { projects },
		outputPath: 'works/oss/index.html',
		sourcePaths: [
			'src/pages/works/oss/data.ts',
			'src/pages/works/_components',
			'src/pages/works/WorksProse.css',
			'src/pages/works/oss',
			'src/content/works/oss/list.json',
			'src/content/works/oss/stars.json',
		],
		title: 'Open-source projects',
		pathname: '/works/oss/',
		description:
			'Open-source projects by @ryoppippi across AI tools, Nix, TypeScript, Svelte, Vim, Zig, and shell configuration.',
		assets,
		style: 'works',
	});
}

import type { SiteAssets } from '@/rendering/site-assets.ts';
import { definePage } from '@/generation/define-page.ts';
import type { OssProject } from '@/contents/works-data.ts';
import OssPage from './page.tsx';

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
			'src/contents/works-data.ts',
			'src/pages/works/_components',
			'src/pages/works/WorksProse.css',
			'src/pages/works/oss',
			'src/contents/works/oss/list.json',
			'src/contents/works/oss/stars.json',
		],
		title: 'Open-source projects',
		pathname: '/works/oss/',
		description:
			'Open-source projects by @ryoppippi across AI tools, Nix, TypeScript, Svelte, Vim, Zig, and shell configuration.',
		assets,
		style: 'works',
	});
}

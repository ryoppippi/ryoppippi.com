import type { SiteAssets } from '../../../assets.ts';
import type { GeneratedFile } from '../../../generated-file.ts';
import type { OssProject } from '../../../sections.ts';
import { page, renderComponent } from '../../../html.ts';
import Oss from './index.tsx';

/**
 * Renders the open-source projects page.
 *
 * @param projects - Manually ordered OSS projects to render.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated open-source projects page.
 */
export function ossPage(projects: OssProject[], assets: SiteAssets): GeneratedFile {
	return {
		path: 'works/oss/index.html',
		sourcePaths: [
			'src/site/sections.ts',
			'src/site/pages/works/_components',
			'src/site/pages/works/page.css',
			'src/site/pages/works/oss',
			'src/contents/works/oss/list.json',
			'src/contents/works/oss/stars.json',
		],
		content: page({
			title: 'Open-source projects',
			pathname: '/works/oss/',
			content: renderComponent(Oss, { projects }),
			description:
				'Open-source projects by @ryoppippi across AI tools, Nix, TypeScript, Svelte, Vim, Zig, and shell configuration.',
			assets,
			style: 'works',
		}),
	};
}

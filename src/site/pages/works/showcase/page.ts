import type { ShowcaseProject } from '../../../../content/index.ts';
import type { SiteAssets } from '../../../assets.ts';
import type { GeneratedFile } from '../../../generated-file.ts';
import { page, renderComponent } from '../../../html.ts';
import Showcase from './index.tsx';

/**
 * Renders the project showcase page.
 *
 * @param projects - Showcase projects to render.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated project showcase page.
 */
export function showcasePage(projects: ShowcaseProject[], assets: SiteAssets): GeneratedFile {
	return {
		path: 'works/showcase/index.html',
		sourcePaths: [
			'src/site/pages/works/showcase',
			'src/content/showcase.ts',
			'src/content/showcase',
		],
		content: page({
			title: 'Project showcase',
			pathname: '/works/showcase/',
			content: renderComponent(Showcase, { projects }),
			description:
				'Selected projects and experiments by @ryoppippi, with demos, source links, and implementation notes.',
			assets,
			style: 'works',
		}),
	};
}

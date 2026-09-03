import type { ShowcaseProject } from '@/content/index.ts';
import type { SiteAssets } from '@/site/assets.ts';
import type { GeneratedFile } from '@/site/generated-file.ts';
import { renderComponent, renderHtmlDocument } from '@/site/html.ts';
import ShowcasePage from './page.tsx';

/**
 * Renders the project showcase page.
 *
 * @param projects - Showcase projects to render.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated project showcase page.
 */
export function createShowcasePageFile(
	projects: ShowcaseProject[],
	assets: SiteAssets,
): GeneratedFile {
	return {
		path: 'works/showcase/index.html',
		sourcePaths: [
			'src/site/pages/works/_components',
			'src/site/pages/works/WorksProse.css',
			'src/site/pages/works/showcase',
			'src/content/showcase.ts',
			'src/content/showcase',
		],
		content: renderHtmlDocument({
			title: 'Project showcase',
			pathname: '/works/showcase/',
			content: renderComponent(ShowcasePage, { projects }),
			description:
				'Selected projects and experiments by @ryoppippi, with demos, source links, and implementation notes.',
			assets,
			style: 'works',
		}),
	};
}

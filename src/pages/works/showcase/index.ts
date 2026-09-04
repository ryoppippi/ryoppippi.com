import type { ShowcaseProject } from '@/content/index.ts';
import type { SiteAssets } from '@/rendering/site-assets.ts';
import { definePage } from '@/generation/define-page.ts';
import ShowcasePage from './page.tsx';

/**
 * Renders the project showcase page.
 *
 * @param projects - Showcase projects to render.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated project showcase page.
 */
export function createShowcasePageFile(projects: ShowcaseProject[], assets: SiteAssets) {
	return definePage({
		component: ShowcasePage,
		componentProps: { projects },
		outputPath: 'works/showcase/index.html',
		sourcePaths: [
			'src/pages/works/_components',
			'src/pages/works/WorksProse.css',
			'src/pages/works/showcase',
			'src/content/showcase.ts',
			'src/content/showcase',
		],
		title: 'Project showcase',
		pathname: '/works/showcase/',
		description:
			'Selected projects and experiments by @ryoppippi, with demos, source links, and implementation notes.',
		assets,
		style: 'works',
	});
}

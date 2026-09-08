import type { ShowcaseProject } from '@/pages/works/showcase/data.ts';
import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import { definePage } from '@/components/SiteLayout/page.ts';
import Showcase from './Showcase.tsx';
import type { PageRoutes } from '@/utils/ssg/route.ts';

/** Showcase endpoint shared by dev and SSG. */
export const routes = (() => [
	{
		path: '/works/showcase/',
		render: async ({ assets, loadShowcase }) =>
			createShowcasePageFile(await loadShowcase(), assets),
	},
]) satisfies PageRoutes;

/**
 * Renders the project showcase page.
 *
 * @param projects - Showcase projects to render.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated project showcase page.
 */
export function createShowcasePageFile(projects: ShowcaseProject[], assets: SiteAssets) {
	return definePage({
		component: Showcase,
		componentProps: { projects },
		outputPath: 'works/showcase/index.html',
		sourcePaths: [
			'src/components/WorksNav',
			'src/components/WorksSection',
			'src/components/WorksNav/WorksProse.css',
			'src/pages/works/showcase',
			'src/pages/works/showcase/data.ts',
			'src/content/works/showcase',
		],
		title: 'Project showcase',
		pathname: '/works/showcase/',
		description:
			'Selected projects and experiments by @ryoppippi, with demos, source links, and implementation notes.',
		assets,
		pageModule: '/src/pages/works/showcase/Showcase.tsx',
		style: 'works/showcase',
	});
}

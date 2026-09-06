import type { ShowcaseProject } from '@/pages/works/showcase/data.ts';
import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import { definePage } from '@/pages/page.ts';
import ShowcasePage from './page.tsx';
import type { PageRoutes } from '../../route.ts';

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
		component: ShowcasePage,
		componentProps: { projects },
		outputPath: 'works/showcase/index.html',
		sourcePaths: [
			'src/pages/works/_components',
			'src/pages/works/WorksProse.css',
			'src/pages/works/showcase',
			'src/pages/works/showcase/data.ts',
			'src/content/works/showcase',
		],
		title: 'Project showcase',
		pathname: '/works/showcase/',
		description:
			'Selected projects and experiments by @ryoppippi, with demos, source links, and implementation notes.',
		assets,
		style: 'works',
	});
}

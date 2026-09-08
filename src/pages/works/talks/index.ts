import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import { definePage } from '@/components/SiteLayout/page.ts';
import { loadTalks, type Talk } from './data.ts';
import Talks from './Talks.tsx';
import type { PageRoutes } from '@/utils/ssg/route.ts';

/** Talks endpoint shared by dev and SSG. */
export const routes = (() => [
	{
		path: '/works/talks/',
		render: async ({ assets }) => createTalksPageFile(await loadTalks(), assets),
	},
]) satisfies PageRoutes;

/**
 * Renders the talks page.
 *
 * @param talks - Talks loaded from the talks data source.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated talks page.
 */
export function createTalksPageFile(talks: Talk[], assets: SiteAssets) {
	return definePage({
		component: Talks,
		componentProps: { talks },
		outputPath: 'works/talks/index.html',
		sourcePaths: [
			'src/pages/works/talks/data.ts',
			'src/components/WorksNav',
			'src/components/WorksSection',
			'src/components/WorksNav/WorksProse.css',
			'src/pages/works/talks',
		],
		title: 'Talks',
		pathname: '/works/talks/',
		description:
			'Conference talks and presentations by @ryoppippi, with event links, slides, and videos.',
		assets,
		pageModule: '/src/pages/works/talks/Talks.tsx',
		style: 'works/talks',
	});
}

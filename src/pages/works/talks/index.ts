import type { SiteAssets } from '@/rendering/site-assets.ts';
import { definePage } from '@/generation/define-page.ts';
import type { Talk } from '@/content/works-data.ts';
import TalksPage from './page.tsx';
import type { PageRoutes } from '../../route.ts';

/** Talks endpoint shared by dev and SSG. */
export const routes = (() => [
	{
		path: '/works/talks/',
		render: async ({ assets, loadTalks }) => createTalksPageFile(await loadTalks(), assets),
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
		component: TalksPage,
		componentProps: { talks },
		outputPath: 'works/talks/index.html',
		sourcePaths: [
			'src/content/works-data.ts',
			'src/pages/works/_components',
			'src/pages/works/WorksProse.css',
			'src/pages/works/talks',
		],
		title: 'Talks',
		pathname: '/works/talks/',
		description:
			'Conference talks and presentations by @ryoppippi, with event links, slides, and videos.',
		assets,
		style: 'works',
	});
}

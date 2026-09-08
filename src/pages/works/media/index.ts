import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import type { PostListItem } from '@/lib/post-list.ts';
import { definePage } from '@/components/SiteLayout/page.ts';
import Media from './Media.tsx';
import type { PageRoutes } from '@/utils/ssg/route.ts';

/** Media index; feeds are emitted by Ox Content in development and production. */
export const routes = (() => [
	{
		path: '/works/media/',
		render: async ({ assets, loadExternalMedia }) =>
			createMediaPageFile(await loadExternalMedia(), assets),
	},
]) satisfies PageRoutes;

/**
 * Renders the podcasts and videos page.
 *
 * @param items - Curated external media to render.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated media page.
 */
export function createMediaPageFile(items: PostListItem[], assets: SiteAssets) {
	const sorted = items.toSorted((a, b) => b.pubDate.localeCompare(a.pubDate));
	return definePage({
		component: Media,
		componentProps: { items: sorted },
		outputPath: 'works/media/index.html',
		sourcePaths: [
			'src/lib/post-list.ts',
			'src/components/WorksNav',
			'src/components/WorksSection',
			'src/components/WorksNav/WorksProse.css',
			'src/pages/works/media',
			'src/content/works/media/list.json',
		],
		title: 'media',
		pathname: '/works/media/',
		description: 'Podcasts, interviews, and videos featuring @ryoppippi.',
		assets,
		pageModule: '/src/pages/works/media/Media.tsx',
		style: 'works/media',
	});
}

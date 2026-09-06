import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import type { PostListItem } from '@/pages/post-list.ts';
import { definePage } from '@/pages/page.ts';
import MediaPage from './page.tsx';
import type { PageRoutes } from '../../route.ts';
import { renderMediaFeed } from './feed.ts';

/** Media page and development feed; production feeds are emitted by Ox Content. */
export const routes = (() => [
	{
		path: '/works/media/',
		render: async ({ assets, loadExternalMedia }) =>
			createMediaPageFile(await loadExternalMedia(), assets),
	},
	{
		path: '/works/media/feed.xml',
		devOnly: true,
		render: async ({ loadExternalMedia }) => {
			const feed = await renderMediaFeed(await loadExternalMedia());
			return { path: 'works/media/feed.xml', content: feed.content, contentType: feed.contentType };
		},
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
		component: MediaPage,
		componentProps: { items: sorted },
		outputPath: 'works/media/index.html',
		sourcePaths: [
			'src/pages/post-list.ts',
			'src/pages/works/_components',
			'src/pages/works/WorksProse.css',
			'src/pages/works/media',
			'src/content/works/media/list.json',
		],
		title: 'Media',
		pathname: '/works/media/',
		description: 'Podcasts, interviews, and videos featuring @ryoppippi.',
		assets,
		style: 'works',
	});
}

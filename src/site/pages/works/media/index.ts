import type { SiteAssets } from '@/site/assets.ts';
import type { PostListItem } from '@/site/content.ts';
import { definePage } from '@/site/define-page.ts';
import MediaPage from './page.tsx';

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
			'src/site/content.ts',
			'src/site/pages/works/_components',
			'src/site/pages/works/WorksProse.css',
			'src/site/pages/works/media',
			'src/contents/external-rss/media.json',
		],
		title: 'Media',
		pathname: '/works/media/',
		description: 'Podcasts, interviews, and videos featuring @ryoppippi.',
		assets,
		style: 'works',
	});
}

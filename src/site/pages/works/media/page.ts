import type { SiteAssets } from '../../../assets.ts';
import type { PostListItem } from '../../../content.ts';
import type { GeneratedFile } from '../../../generated-file.ts';
import { page, renderComponent } from '../../../html.ts';
import Media from './index.tsx';

/**
 * Renders the podcasts and videos page.
 *
 * @param items - Curated external media to render.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated media page.
 */
export function mediaPage(items: PostListItem[], assets: SiteAssets): GeneratedFile {
	const sorted = items.toSorted((a, b) => b.pubDate.localeCompare(a.pubDate));
	return {
		path: 'works/media/index.html',
		sourcePaths: [
			'src/site/content.ts',
			'src/site/pages/works/_components',
			'src/site/pages/works/page.css',
			'src/site/pages/works/media',
			'src/contents/external-rss/media.json',
		],
		content: page({
			title: 'Media',
			pathname: '/works/media/',
			content: renderComponent(Media, { items: sorted }),
			description: 'Podcasts, interviews, and videos featuring @ryoppippi.',
			assets,
			style: 'works',
		}),
	};
}

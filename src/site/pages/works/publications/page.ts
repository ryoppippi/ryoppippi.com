import type { SiteAssets } from '../../../assets.ts';
import type { GeneratedFile } from '../../../generated-file.ts';
import { page, renderComponent } from '../../../html.ts';
import Publications from './index.tsx';

type Publication = { title: string; link: string; authors: string; publisher: string };

/**
 * Renders the publications page.
 *
 * @param publications - Publications grouped by their year or category.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated publications page.
 */
export function publicationsPage(
	publications: Record<string, Publication[]>,
	assets: SiteAssets,
): GeneratedFile {
	return {
		path: 'works/publications/index.html',
		sourcePaths: [
			'src/site/sections.ts',
			'src/site/pages/works/publications',
			'src/contents/publication.json',
		],
		content: page({
			title: 'Publications',
			pathname: '/works/publications/',
			content: renderComponent(Publications, { publications }),
			description:
				'Research papers and technical publications authored or co-authored by @ryoppippi.',
			assets,
			style: 'works',
		}),
	};
}

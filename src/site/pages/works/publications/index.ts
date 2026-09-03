import type { SiteAssets } from '@/site/assets.ts';
import type { GeneratedFile } from '@/site/generated-file.ts';
import { renderComponent, renderHtmlDocument } from '@/site/html.ts';
import PublicationsPage from './page.tsx';

type Publication = { title: string; link: string; authors: string; publisher: string };

/**
 * Renders the publications page.
 *
 * @param publications - Publications grouped by their year or category.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated publications page.
 */
export function createPublicationsPageFile(
	publications: Record<string, Publication[]>,
	assets: SiteAssets,
): GeneratedFile {
	return {
		path: 'works/publications/index.html',
		sourcePaths: [
			'src/site/sections.ts',
			'src/site/pages/works/_components',
			'src/site/pages/works/WorksProse.css',
			'src/site/pages/works/publications',
			'src/contents/publication.json',
		],
		content: renderHtmlDocument({
			title: 'Publications',
			pathname: '/works/publications/',
			content: renderComponent(PublicationsPage, { publications }),
			description:
				'Research papers and technical publications authored or co-authored by @ryoppippi.',
			assets,
			style: 'works',
		}),
	};
}

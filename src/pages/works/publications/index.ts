import type { SiteAssets } from '@/rendering/site-assets.ts';
import { definePage } from '@/generation/define-page.ts';
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
) {
	return definePage({
		component: PublicationsPage,
		componentProps: { publications },
		outputPath: 'works/publications/index.html',
		sourcePaths: [
			'src/contents/works-data.ts',
			'src/pages/works/_components',
			'src/pages/works/WorksProse.css',
			'src/pages/works/publications',
			'src/contents/publication.json',
		],
		title: 'Publications',
		pathname: '/works/publications/',
		description:
			'Research papers and technical publications authored or co-authored by @ryoppippi.',
		assets,
		style: 'works',
	});
}

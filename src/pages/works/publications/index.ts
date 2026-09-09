import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import { definePage } from '@/components/SiteLayout/page.ts';
import Publications from './Publications.svelte';
import { loadPublications } from './data.ts';
import type { PageRoutes } from '@/utils/ssg/route.ts';

/** Publications endpoint shared by dev and SSG. */
export const routes = (() => [
	{
		path: '/works/publications/',
		render: async ({ root, assets }) =>
			createPublicationsPageFile(await loadPublications(root), assets),
	},
]) satisfies PageRoutes;

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
		component: Publications,
		componentProps: { publications },
		outputPath: 'works/publications/index.html',
		sourcePaths: [
			'src/pages/works/publications/data.ts',
			'src/components/WorksNav',
			'src/components/WorksSection',
			'src/components/WorksNav/WorksProse.css',
			'src/pages/works/publications',
			'src/content/works/publications/list.json',
		],
		title: 'publications',
		pathname: '/works/publications/',
		description:
			'Research papers and technical publications authored or co-authored by @ryoppippi.',
		assets,
		pageModule: '/src/pages/works/publications/Publications.svelte',
		style: 'works/publications',
	});
}

import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import { definePage } from '@/components/SiteLayout/page.ts';
import Error from './Error.svelte';
import { SITE_ORIGIN } from '@/config/site.ts';
import * as ufo from 'ufo';
import type { PageRoutes } from '@/utils/ssg/route.ts';

/** Prerendered error document. */
export const routes = (() => [
	{ path: '/404.html', render: ({ assets }) => createErrorPageFile(assets) },
	{
		path: '/404.md',
		render: () => ({
			outputPath: '404.md',
			body: `# Page not found

The requested page does not exist on ${SITE_ORIGIN}. See ${ufo.joinURL(SITE_ORIGIN, 'llms.txt')} for an index of the site, or ${ufo.joinURL(SITE_ORIGIN, 'sitemap.xml')} for every page.
`,
			contentType: 'text/markdown; charset=utf-8',
		}),
	},
]) satisfies PageRoutes;

/**
 * Renders the non-indexable error page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated error page.
 */
export function createErrorPageFile(assets: SiteAssets) {
	return definePage({
		component: Error,
		componentProps: {},
		outputPath: '404.html',
		sourcePaths: ['src/pages/404.html'],
		title: 'page not found',
		pathname: '/404',
		description: 'The requested page could not be found.',
		indexable: false,
		assets,
		pageModule: '/src/pages/404.html/Error.svelte',
		style: '404.html',
	});
}

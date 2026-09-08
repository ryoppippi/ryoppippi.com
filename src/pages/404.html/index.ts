import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import { definePage } from '@/components/SiteLayout/page.ts';
import Error from './Error.tsx';
import type { PageRoutes } from '@/utils/ssg/route.ts';

/** Prerendered error document. */
export const routes = (() => [
	{ path: '/404.html', render: ({ assets }) => createErrorPageFile(assets) },
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
		pageModule: '/src/pages/404.html/Error.tsx',
		style: '404.html',
	});
}

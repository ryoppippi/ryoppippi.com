import type { SiteAssets } from '@/rendering/site-assets.ts';
import { definePage } from '@/generation/define-page.ts';
import ErrorPage from './page.tsx';
import type { PageRoutes } from '../route.ts';

/** Prerendered error document. */
export const routes = (() => [
	{ path: '/404.html', render: async ({ assets }) => createErrorPageFile(assets) },
]) satisfies PageRoutes;

/**
 * Renders the non-indexable error page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated error page.
 */
export function createErrorPageFile(assets: SiteAssets) {
	return definePage({
		component: ErrorPage,
		componentProps: {},
		outputPath: '404.html',
		sourcePaths: ['src/pages/error'],
		title: 'Page not found',
		pathname: '/404',
		description: 'The requested page could not be found.',
		indexable: false,
		assets,
		style: 'error',
	});
}

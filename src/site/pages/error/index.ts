import type { SiteAssets } from '@/site/assets.ts';
import { definePage } from '@/site/define-page.ts';
import ErrorPage from './page.tsx';

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
		sourcePaths: ['src/site/pages/error'],
		title: 'Page not found',
		pathname: '/404',
		description: 'The requested page could not be found.',
		indexable: false,
		assets,
		style: 'error',
	});
}

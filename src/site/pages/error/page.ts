import type { SiteAssets } from '../../assets.ts';
import type { GeneratedFile } from '../../generated-file.ts';
import { page, renderComponent } from '../../html.ts';
import ErrorPage from './index.tsx';

/**
 * Renders the non-indexable error page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated error page.
 */
export function errorPage(assets: SiteAssets): GeneratedFile {
	return {
		path: '404.html',
		sourcePaths: ['src/site/pages/error'],
		content: page({
			title: 'Page not found',
			pathname: '/404',
			content: renderComponent(ErrorPage, {}),
			description: 'The requested page could not be found.',
			indexable: false,
			assets,
			style: 'error',
		}),
	};
}

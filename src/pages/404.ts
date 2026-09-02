import type { GeneratedFile } from './index.ts';
import type { SiteAssets } from '../site/assets.ts';
import { page, renderComponent } from '../site/html.ts';
import ErrorPage from '../site/templates/Error.tsx';

/**
 * Renders the non-indexable error page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated error page.
 */
export function errorPage(assets: SiteAssets): GeneratedFile {
	return {
		path: '404.html',
		sourcePaths: ['src/pages/404.ts', 'src/site/templates/Error.tsx'],
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

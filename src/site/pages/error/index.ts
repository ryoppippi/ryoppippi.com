import type { SiteAssets } from '@/site/assets.ts';
import type { GeneratedFile } from '@/site/generated-file.ts';
import { renderComponent, renderHtmlDocument } from '@/site/html.ts';
import ErrorPage from './page.tsx';

/**
 * Renders the non-indexable error page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated error page.
 */
export function createErrorPageFile(assets: SiteAssets): GeneratedFile {
	return {
		path: '404.html',
		sourcePaths: ['src/site/pages/error'],
		content: renderHtmlDocument({
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

import type { SiteAssets } from '@/site/assets.ts';
import type { GeneratedFile } from '@/site/generated-file.ts';
import { renderComponent, renderHtmlDocument } from '@/site/html.ts';
import SponsorsPage from './page.tsx';

/**
 * Renders the sponsors page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated sponsors page.
 */
export function createSponsorsPageFile(assets: SiteAssets): GeneratedFile {
	return {
		path: 'sponsors/index.html',
		sourcePaths: ['src/site/pages/sponsors'],
		content: renderHtmlDocument({
			title: 'Sponsors',
			pathname: '/sponsors/',
			content: renderComponent(SponsorsPage, {}),
			description:
				"Support @ryoppippi's open-source projects, technical writing, and talks through GitHub Sponsors.",
			assets,
			style: 'sponsors',
		}),
	};
}

import type { SiteAssets } from '../../assets.ts';
import type { GeneratedFile } from '../../generated-file.ts';
import { page, renderComponent } from '../../html.ts';
import Sponsors from './index.tsx';

/**
 * Renders the sponsors page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated sponsors page.
 */
export function sponsorsPage(assets: SiteAssets): GeneratedFile {
	return {
		path: 'sponsors/index.html',
		sourcePaths: ['src/site/pages/sponsors'],
		content: page({
			title: 'Sponsors',
			pathname: '/sponsors/',
			content: renderComponent(Sponsors, {}),
			description:
				"Support @ryoppippi's open-source projects, technical writing, and talks through GitHub Sponsors.",
			assets,
			style: 'sponsors',
		}),
	};
}

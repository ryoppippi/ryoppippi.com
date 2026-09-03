import type { SiteAssets } from '@/site/assets.ts';
import { definePage } from '@/site/define-page.ts';
import SponsorsPage from './page.tsx';

/**
 * Renders the sponsors page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated sponsors page.
 */
export function createSponsorsPageFile(assets: SiteAssets) {
	return definePage({
		component: SponsorsPage,
		componentProps: {},
		outputPath: 'sponsors/index.html',
		sourcePaths: ['src/site/pages/sponsors'],
		title: 'Sponsors',
		pathname: '/sponsors/',
		description:
			"Support @ryoppippi's open-source projects, technical writing, and talks through GitHub Sponsors.",
		assets,
		style: 'sponsors',
	});
}

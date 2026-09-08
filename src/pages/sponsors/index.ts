import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import { definePage } from '@/components/SiteLayout/page.ts';
import Sponsors from './Sponsors.tsx';
import type { PageRoutes } from '@/utils/ssg/route.ts';

/** Sponsors endpoint shared by dev and SSG. */
export const routes = (() => [
	{ path: '/sponsors/', render: ({ assets }) => createSponsorsPageFile(assets) },
]) satisfies PageRoutes;

/**
 * Renders the sponsors page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated sponsors page.
 */
export function createSponsorsPageFile(assets: SiteAssets) {
	return definePage({
		component: Sponsors,
		componentProps: {},
		outputPath: 'sponsors/index.html',
		sourcePaths: ['src/pages/sponsors'],
		title: 'sponsors',
		pathname: '/sponsors/',
		description:
			"Support @ryoppippi's open-source projects, technical writing, and talks through GitHub Sponsors.",
		assets,
		pageModule: '/src/pages/sponsors/Sponsors.tsx',
		style: 'sponsors',
	});
}

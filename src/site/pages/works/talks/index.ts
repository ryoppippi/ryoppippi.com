import type { SiteAssets } from '@/site/assets.ts';
import { definePage } from '@/site/define-page.ts';
import type { Talk } from '@/site/sections.ts';
import TalksPage from './page.tsx';

/**
 * Renders the talks page.
 *
 * @param talks - Talks loaded from the talks data source.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated talks page.
 */
export function createTalksPageFile(talks: Talk[], assets: SiteAssets) {
	return definePage({
		component: TalksPage,
		componentProps: { talks },
		outputPath: 'works/talks/index.html',
		sourcePaths: [
			'src/site/sections.ts',
			'src/site/pages/works/_components',
			'src/site/pages/works/WorksProse.css',
			'src/site/pages/works/talks',
		],
		title: 'Talks',
		pathname: '/works/talks/',
		description:
			'Conference talks and presentations by @ryoppippi, with event links, slides, and videos.',
		assets,
		style: 'works',
	});
}

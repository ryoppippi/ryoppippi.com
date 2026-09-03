import type { SiteAssets } from '@/site/assets.ts';
import type { GeneratedFile } from '@/site/generated-file.ts';
import { renderComponent, renderHtmlDocument } from '@/site/html.ts';
import type { Talk } from '@/site/sections.ts';
import TalksPage from './page.tsx';

/**
 * Renders the talks page.
 *
 * @param talks - Talks loaded from the talks data source.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated talks page.
 */
export function createTalksPageFile(talks: Talk[], assets: SiteAssets): GeneratedFile {
	return {
		path: 'works/talks/index.html',
		sourcePaths: [
			'src/site/sections.ts',
			'src/site/pages/works/_components',
			'src/site/pages/works/WorksProse.css',
			'src/site/pages/works/talks',
		],
		content: renderHtmlDocument({
			title: 'Talks',
			pathname: '/works/talks/',
			content: renderComponent(TalksPage, { talks }),
			description:
				'Conference talks and presentations by @ryoppippi, with event links, slides, and videos.',
			assets,
			style: 'works',
		}),
	};
}

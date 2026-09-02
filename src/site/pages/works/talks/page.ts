import type { SiteAssets } from '../../../assets.ts';
import type { GeneratedFile } from '../../../generated-file.ts';
import type { Talk } from '../../../sections.ts';
import { page, renderComponent } from '../../../html.ts';
import Talks from './index.tsx';

/**
 * Renders the talks page.
 *
 * @param talks - Talks loaded from the talks data source.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated talks page.
 */
export function talksPage(talks: Talk[], assets: SiteAssets): GeneratedFile {
	return {
		path: 'works/talks/index.html',
		sourcePaths: ['src/site/sections.ts', 'src/site/pages/works/talks'],
		content: page({
			title: 'Talks',
			pathname: '/works/talks/',
			content: renderComponent(Talks, { talks }),
			description:
				'Conference talks and presentations by @ryoppippi, with event links, slides, and videos.',
			assets,
			style: 'works',
		}),
	};
}

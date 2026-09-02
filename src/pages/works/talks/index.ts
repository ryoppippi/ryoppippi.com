import type { GeneratedFile } from '../../index.ts';
import type { SiteAssets } from '../../../site/assets.ts';
import { page, renderComponent } from '../../../site/html.ts';
import Talks from '../../../site/templates/Talks.tsx';

export type Talk = {
	title: string;
	date: string;
	lang?: string;
	event: string;
	eventLink?: string;
	videoLink?: string;
	links: string[];
};

/** Loads the talks used by the talks page. */
export async function loadTalks(): Promise<Talk[]> {
	const response = await fetch('https://talks.ryoppippi.com/talks.json');
	if (!response.ok) {
		throw new Error('Failed to fetch talks: ' + response.status + ' ' + response.statusText);
	}
	return (await response.json()) as Talk[];
}

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
		sourcePaths: ['src/pages/works/talks/index.ts', 'src/site/templates/Talks.tsx'],
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

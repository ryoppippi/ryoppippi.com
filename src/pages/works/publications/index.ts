import type { GeneratedFile } from '../../index.ts';
import type { SiteAssets } from '../../../site/assets.ts';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { page, renderComponent } from '../../../site/html.ts';
import Publications from '../../../site/templates/Publications.tsx';

export type Publication = {
	title: string;
	link: string;
	authors: string;
	publisher: string;
};

/** Loads publications grouped by year or category. */
export async function loadPublications(root: string): Promise<Record<string, Publication[]>> {
	return JSON.parse(
		await readFile(path.join(root, 'src/content/publication.json'), 'utf8'),
	) as Record<string, Publication[]>;
}

/**
 * Renders the publications page.
 *
 * @param publications - Publications grouped by their year or category.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated publications page.
 */
export function publicationsPage(
	publications: Record<string, Publication[]>,
	assets: SiteAssets,
): GeneratedFile {
	return {
		path: 'works/publications/index.html',
		sourcePaths: [
			'src/pages/works/publications/index.ts',
			'src/site/templates/Publications.tsx',
			'src/content/publication.json',
		],
		content: page({
			title: 'Publications',
			pathname: '/works/publications/',
			content: renderComponent(Publications, { publications }),
			description:
				'Research papers and technical publications authored or co-authored by @ryoppippi.',
			assets,
			style: 'works',
		}),
	};
}

import type { PostListItem } from '../../blog/index.ts';
import type { GeneratedFile } from '../../index.ts';
import type { SiteAssets } from '../../../site/assets.ts';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { page, renderComponent } from '../../../site/html.ts';
import Media from '../../../site/templates/Media.tsx';

type ExternalMediaInput = {
	title?: string | null;
	link?: string | null;
	pubDate?: string | null;
	guid?: string | null;
	lang?: string | null;
	kind?: 'article' | 'podcast' | 'video' | null;
	playlist?: boolean | null;
};

/** Loads curated podcasts and videos for the media page. */
export async function loadExternalMedia(root: string): Promise<PostListItem[]> {
	const source = await readFile(path.join(root, 'src/content/external-rss/media.json'), 'utf8');
	const configuredMedia = JSON.parse(source) as ExternalMediaInput[];
	return configuredMedia.flatMap((item) => {
		if (item.title == null || item.link == null || item.pubDate == null) {
			return [];
		}
		const pubDate = new Date(item.pubDate);
		if (Number.isNaN(pubDate.getTime())) {
			return [];
		}
		return [
			{
				title: item.title,
				slug: item.guid ?? item.link,
				link: item.link,
				pubDate: pubDate.toJSON(),
				lang: item.lang ?? 'ja',
				external: true,
				kind: item.kind ?? 'podcast',
				...(item.playlist === true ? { playlist: true } : {}),
			} satisfies PostListItem,
		];
	});
}

/**
 * Renders the podcasts and videos page.
 *
 * @param items - Curated external media to render.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated media page.
 */
export function mediaPage(items: PostListItem[], assets: SiteAssets): GeneratedFile {
	const sorted = items.toSorted((a, b) => b.pubDate.localeCompare(a.pubDate));
	return {
		path: 'works/media/index.html',
		sourcePaths: [
			'src/pages/works/media/index.ts',
			'src/site/templates/Media.tsx',
			'src/content/external-rss/media.json',
		],
		content: page({
			title: 'Media',
			pathname: '/works/media/',
			content: renderComponent(Media, { items: sorted }),
			description: 'Podcasts, interviews, and videos featuring @ryoppippi.',
			assets,
			style: 'works',
		}),
	};
}

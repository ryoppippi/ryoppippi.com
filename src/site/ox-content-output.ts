import type { PostListItem } from './content.ts';
import type { GeneratedFile } from './pages.ts';
import {
	planSsgOutputs,
	resolveGitLastmod,
	writeFeedFiles,
	writeSiteMapFiles,
} from '@ox-content/vite-plugin';
import path from 'node:path';
import { SITE_COPYRIGHT, SITE_NAME, SITE_ORIGIN, SITE_SOCIAL_IMAGE_URL } from './consts.ts';

type GitLastmodResolver = (filePath: string, root?: string) => number | undefined;

type WriteOxContentOutputFilesOptions = {
	media: readonly PostListItem[];
	outDir: string;
	pages: readonly GeneratedFile[];
	resolveLastmod?: GitLastmodResolver;
	root: string;
};

function latestSourceLastmod(
	root: string,
	sourcePaths: readonly string[],
	resolveLastmod: GitLastmodResolver,
): number | undefined {
	let latest: number | undefined;
	for (const sourcePath of sourcePaths) {
		const timestamp = resolveLastmod(path.resolve(root, sourcePath), root);
		if (timestamp != null && (latest == null || timestamp > latest)) {
			latest = timestamp;
		}
	}
	return latest;
}

/**
 * Writes custom-host sitemap and media-feed outputs through Ox Content.
 *
 * @param options - Generated HTML pages, curated media, and output paths.
 * @returns A promise that resolves after both outputs have been written.
 * @example
 * ```ts
 * await writeOxContentOutputFiles({ pages, media, outDir, root });
 * ```
 */
export async function writeOxContentOutputFiles({
	media,
	outDir,
	pages,
	resolveLastmod = resolveGitLastmod,
	root,
}: WriteOxContentOutputFilesOptions): Promise<void> {
	const sitePages = pages
		.filter((file) => file.path.endsWith('.html') && file.path !== '404.html')
		.map((file) => {
			const sourcePaths = file.sourcePaths ?? [];
			return {
				inputPath: path.resolve(root, sourcePaths[0] ?? 'src/site/generate.ts'),
				urlPath: file.path.replace(/(?:index)?\.html$/u, ''),
				lastUpdated: latestSourceLastmod(root, sourcePaths, resolveLastmod),
			};
		});
	const plan = planSsgOutputs({
		outDir,
		root,
		pages: sitePages,
		items: media
			.filter((item) => item.playlist !== true)
			.map((item) => ({
				title: item.title,
				loc: item.link,
				date: item.pubDate,
				description: `${item.kind === 'video' ? 'YouTube' : 'Podcast'} | ${item.title}`,
			})),
		options: {
			feeds: {
				formats: ['rss'],
				limit: 1_000,
				path: '/works/media',
				title: `Media | ${SITE_NAME}`,
				description: `Media appearances by ${SITE_NAME}`,
				language: 'ja',
				image: SITE_SOCIAL_IMAGE_URL,
				favicon: SITE_SOCIAL_IMAGE_URL,
				copyright: SITE_COPYRIGHT,
			},
			siteMaps: { robots: false, llms: false },
			ssg: {
				enabled: false,
				siteName: SITE_NAME,
				siteUrl: SITE_ORIGIN,
			},
		},
	});

	const [feeds, siteMaps] = await Promise.all([
		writeFeedFiles(plan.feeds),
		writeSiteMapFiles(plan.siteMaps),
	]);
	const warnings = [feeds.warning, siteMaps.warning].filter(
		(warning): warning is string => warning != null,
	);
	if (warnings.length > 0) {
		throw new Error(warnings.join('\n'));
	}
}

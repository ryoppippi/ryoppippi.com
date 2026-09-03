import type { PostListItem } from '@/contents/external-content.ts';
import type { GeneratedFile } from './generated-file.ts';
import { planSsgOutputs, resolveGitLastmod, writeSiteMapFiles } from '@ox-content/vite-plugin';
import path from 'node:path';
import { SITE_NAME, SITE_ORIGIN } from '@/config/site.ts';
import { writeMediaFeed } from './feeds.ts';

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
				inputPath: path.resolve(root, sourcePaths[0] ?? 'src/generation/generate-static-site.ts'),
				urlPath: file.path.replace(/(?:index)?\.html$/u, ''),
				lastUpdated: latestSourceLastmod(root, sourcePaths, resolveLastmod),
			};
		});
	const plan = planSsgOutputs({
		outDir,
		root,
		pages: sitePages,
		options: {
			siteMaps: { robots: false, llms: false },
			ssg: {
				enabled: false,
				siteName: SITE_NAME,
				siteUrl: SITE_ORIGIN,
			},
		},
	});

	const [, siteMaps] = await Promise.all([
		writeMediaFeed(media, outDir),
		writeSiteMapFiles(plan.siteMaps),
	]);
	const warnings = [siteMaps.warning].filter((warning): warning is string => warning != null);
	if (warnings.length > 0) {
		throw new Error(warnings.join('\n'));
	}
}

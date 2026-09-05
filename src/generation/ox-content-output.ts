import type { PostListItem } from '@/contents/external-content.ts';
import type { GeneratedFile } from './generated-file.ts';
import {
	planSsgOutputs,
	resolveGitLastmod,
	writeSiteMapFiles,
	writeRedirectOutputs,
} from '@ox-content/vite-plugin';
import { OX_CONTENT_BUILD_OPTIONS } from '@/config/ox-content.ts';
import path from 'node:path';
import { SITE_NAME, SITE_ORIGIN } from '@/config/site.ts';
import { renderBlogFeed, writeMediaFeed } from './feeds.ts';
import type { BlogPostMetadata } from '../content/blog.ts';
import { writeFile } from 'node:fs/promises';

type GitLastmodResolver = (filePath: string, root?: string) => number | undefined;

type WriteOxContentOutputFilesOptions = {
	posts: readonly BlogPostMetadata[];
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
 * Writes custom-host sitemap and blog/media feeds through Ox Content.
 *
 * @param options - Generated HTML pages, curated media, and output paths.
 * @returns A promise that resolves after all outputs have been written.
 * @example
 * ```ts
 * await writeOxContentOutputFiles({ posts, pages, media, outDir, root });
 * ```
 */
export async function writeOxContentOutputFiles({
	posts,
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
		renderBlogFeed(posts).then((feed) => writeFile(path.join(outDir, feed.path), feed.content)),
		writeRedirectOutputs({
			outDir,
			redirects: OX_CONTENT_BUILD_OPTIONS.redirects,
			occupiedPaths: sitePages.map(({ urlPath }) => `/${urlPath}`),
		}),
	]);
	const warnings = [siteMaps.warning].filter((warning): warning is string => warning != null);
	if (warnings.length > 0) {
		throw new Error(warnings.join('\n'));
	}
}

if (import.meta.vitest != null) {
	it('writes host-owned blog metadata and links the media feed to its page', async () => {
		const { createFixture } = await import('fs-fixture');
		const { readFile } = await import('node:fs/promises');
		await using fixture = await createFixture({ 'feed.xml': 'previous SSG feed' });
		const post = {
			title: 'Published article',
			filename: 'article',
			filepath: '/content/article.md',
			pubDate: '2026-01-01T00:00:00.000Z',
			lang: 'en',
			isPublished: true,
			readingTime: 2,
		} satisfies BlogPostMetadata;
		await writeOxContentOutputFiles({
			posts: [
				post,
				{ ...post, title: 'Unpublished article', filename: 'draft', isPublished: false },
			],
			media: [],
			outDir: fixture.getPath(),
			root: fixture.getPath(),
			pages: [{ path: 'index.html', content: '<p>Home</p>' }],
			resolveLastmod: () => undefined,
		});
		const blog = await readFile(fixture.getPath('feed.xml'), 'utf8');
		expect(blog).toContain('Published article | 2 min read');
		expect(blog).not.toContain('Unpublished article');
		const media = await readFile(fixture.getPath('works/media/feed.xml'), 'utf8');
		expect(media).toContain('<link>https://ryoppippi.com/works/media/</link>');
	});
}

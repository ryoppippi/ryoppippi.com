import type { ContentArtifact } from '@/content/artifact.ts';
import type { GeneratedFile } from './generated-file.ts';
import type { SiteAssets } from '@/rendering/site-assets.ts';
import { rewriteCollectionAssetUrls, writeCollectionAssets } from '@ox-content/vite-plugin';
import {
	extractInstallSection,
	extractSection,
	fetchDotfilesReadme,
	parseStepCommands,
} from '@/lib/dotfiles.ts';
import { collectionAssetUrls, planSiteContentAssets } from './content-assets.ts';
import {
	loadExternalMedia,
	loadExternalPosts,
	postListItems,
} from '@/contents/external-content.ts';
import { writeOxContentOutputFiles } from './ox-content-output.ts';
import { createAboutPageFile } from '@/pages/about';
import { createArticlePageFiles } from '@/pages/blog/article';
import { createBlogListPageFile } from '@/pages/blog';
import { createErrorPageFile } from '@/pages/error';
import { createHomePageFile } from '@/pages/home';
import { createSponsorsPageFile } from '@/pages/sponsors';
import { createMediaPageFile } from '@/pages/works/media';
import { createOssPageFile } from '@/pages/works/oss';
import { createPublicationsPageFile } from '@/pages/works/publications';
import { createShowcasePageFile } from '@/pages/works/showcase';
import { createTalksPageFile } from '@/pages/works/talks';
import { loadOssProjects, loadPublications, loadTalks } from '@/contents/works-data.ts';

type GenerateStaticSiteOptions = {
	assets: SiteAssets;
	content?: ContentArtifact;
	outDir: string;
	root: string;
};

/**
 * Prepares site-owned pages and writes auxiliary content outputs.
 *
 * @param assets - Bundled site assets referenced by generated pages.
 * @param content - Optional prebuilt content artifact.
 * @param outDir - Directory that receives generated files.
 * @param root - Repository root used for source loading and Git metadata.
 * @returns Pages and plain-text files for the framework host writer.
 */
export async function generateStaticSite({
	assets,
	content,
	outDir,
	root,
}: GenerateStaticSiteOptions): Promise<GeneratedFile[]> {
	let localContent = content;
	if (localContent == null) {
		const { buildContentArtifact } = await import('@/content/build.ts');
		localContent = await buildContentArtifact();
	}
	const [externalPosts, externalMedia, ossProjects, publications, talks, dotfiles] =
		await Promise.all([
			loadExternalPosts(root),
			loadExternalMedia(root),
			loadOssProjects(root),
			loadPublications(root),
			loadTalks(),
			fetchDotfilesReadme(fetch),
		]);
	const contentAssets = await planSiteContentAssets(
		root,
		new Set(
			localContent.posts.filter((post) => post.isPublished === true).map((post) => post.filename),
		),
	);
	await writeCollectionAssets({ manifest: contentAssets, outDir });
	const assetUrls = collectionAssetUrls(contentAssets);
	const posts = localContent.posts.map((post) => ({
		...post,
		html: rewriteCollectionAssetUrls({
			html: post.html,
			pagePath: `/blog/${post.filename}/`,
			manifest: contentAssets,
		}).html,
	}));
	const showcase = localContent.showcase.map((project) => ({
		...project,
		image:
			project.image == null
				? undefined
				: (assetUrls.get(new URL(project.image, 'https://content.invalid').pathname) ??
					project.image),
	}));
	const aboutPageFile = createAboutPageFile(assets);

	const pages = [
		createHomePageFile(assets),
		createBlogListPageFile([...externalPosts, ...postListItems(posts)], assets),
		...posts
			.filter((post) => post.isPublished)
			.flatMap((post) => createArticlePageFiles(post, assets)),
		aboutPageFile,
		createOssPageFile(ossProjects, assets),
		createShowcasePageFile(showcase, assets),
		createPublicationsPageFile(publications, assets),
		createTalksPageFile(talks, assets),
		createMediaPageFile(externalMedia, assets),
		createSponsorsPageFile(assets),
		createErrorPageFile(assets),
	];

	await writeOxContentOutputFiles({ posts, media: externalMedia, outDir, pages, root });

	const install = extractSection(dotfiles, 'Setup');
	const osSections = [
		['mac', 'macOS'],
		['linux', 'Linux'],
	] as const;
	const plainFiles: GeneratedFile[] = [
		{ path: 'dotfiles.md', content: dotfiles },
		{ path: 'dotfiles/install', content: install },
	];

	for (const [slug, heading] of osSections) {
		const section = extractInstallSection(dotfiles, heading);
		plainFiles.push({ path: `dotfiles/${slug}.html`, content: section });
		plainFiles.push(
			...parseStepCommands(section).map(({ step, command }) => ({
				path: `dotfiles/${slug}/${step}`,
				content: command,
			})),
		);
	}

	return [...pages, ...plainFiles];
}

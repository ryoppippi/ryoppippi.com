import type { ContentArtifact } from '@/content/artifact.ts';
import type { GeneratedFile } from './generated-file.ts';
import type { SiteAssets } from '@/rendering/site-assets.ts';
import { rewriteCollectionAssetUrls } from '@ox-content/vite-plugin';
import {
	extractInstallSection,
	extractSection,
	fetchDotfilesReadme,
	parseStepCommands,
} from '@/lib/dotfiles.ts';
import { collectionAssetUrls, planSiteContentAssets } from './content-assets.ts';
import { loadExternalPosts, postListItems } from '@/content/external-content.ts';
import type { PostListItem } from '@/content/external-content.ts';
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
import { loadOssProjects, loadPublications, loadTalks } from '@/content/works-data.ts';

type GenerateStaticSiteOptions = {
	assets: SiteAssets;
	content: ContentArtifact;
	externalMedia: PostListItem[];
	root: string;
};

/**
 * Prepares site-owned pages and plain-text outputs.
 *
 * @param assets - Bundled site assets referenced by generated pages.
 * @param content - Prebuilt content shared with coordinated outputs.
 * @param externalMedia - Curated media shared with the media feed.
 * @param root - Repository root used for source loading and Git metadata.
 * @returns Pages and plain-text files for the framework host writer.
 */
export async function generateStaticSite({
	assets,
	content,
	externalMedia,
	root,
}: GenerateStaticSiteOptions): Promise<GeneratedFile[]> {
	const [externalPosts, ossProjects, publications, talks, dotfiles] = await Promise.all([
		loadExternalPosts(root),
		loadOssProjects(root),
		loadPublications(root),
		loadTalks(),
		fetchDotfilesReadme(fetch),
	]);
	const contentAssets = await planSiteContentAssets(
		root,
		new Set(content.posts.filter((post) => post.isPublished === true).map((post) => post.filename)),
	);
	const assetUrls = collectionAssetUrls(contentAssets);
	const posts = content.posts.map((post) => ({
		...post,
		html: rewriteCollectionAssetUrls({
			html: post.html,
			pagePath: `/blog/${post.filename}/`,
			manifest: contentAssets,
		}).html,
	}));
	const showcase = content.showcase.map((project) => ({
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

import type { ContentArtifact } from '@/content/artifact.ts';
import type { OxContentCustomHostRoute } from '@ox-content/vite-plugin/custom-host';
import type { SiteAssets } from '@/rendering/site-assets.ts';
import { rewriteCollectionAssetUrls } from '@ox-content/vite-plugin';
import { fetchDotfilesReadme } from '@/lib/dotfiles.ts';
import { createPageRoutes } from '@/pages/route.ts';
import { collectionAssetUrls, planSiteContentAssets } from './content-assets.ts';
import { loadExternalPosts } from '@/content/external-content.ts';
import type { PostListItem } from '@/content/external-content.ts';
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
}: GenerateStaticSiteOptions): Promise<OxContentCustomHostRoute[]> {
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
	const publishedPosts = posts.filter((post) => post.isPublished);
	const files = await Promise.all(
		createPageRoutes({ posts: publishedPosts, dotfiles })
			.filter((route) => !route.devOnly)
			.map(async (route) => {
				const result = await route.render({
					assets,
					loadBlogPost: async (slug) =>
						publishedPosts.find((post) => post.filename === slug) ?? null,
					loadBlogPostMetadata: async () => publishedPosts,
					loadBlogPostSource: async (slug) =>
						publishedPosts.find((post) => post.filename === slug)?.source ?? null,
					loadExternalPosts: async () => externalPosts,
					loadExternalMedia: async () => externalMedia,
					loadOssProjects: async () => ossProjects,
					loadPublications: async () => publications,
					loadShowcase: async () => showcase,
					loadTalks: async () => talks,
				});
				return { path: route.path, render: () => result } satisfies OxContentCustomHostRoute;
			}),
	);
	return files;
}

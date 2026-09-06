import type { BlogPost } from './blog/data.ts';
import type { ShowcaseProject } from './works/showcase/data.ts';
import type { OxContentCustomHostRoute } from '@ox-content/vite-plugin/custom-host';
import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import { rewriteCollectionAssetUrls } from '@ox-content/vite-plugin';
import { fetchDotfilesReadme } from '@/pages/dotfiles/data.ts';
import { createPageRoutes } from '@/pages/route.ts';
import { collectionAssetUrls, planSiteContentAssets } from '@/ox-content/content-assets.ts';
import type { PostListItem } from '@/pages/post-list.ts';
import { createPageContext } from '@/pages/context.ts';

type PrerenderPagesOptions = {
	assets: SiteAssets;
	posts: BlogPost[];
	showcase: ShowcaseProject[];
	externalMedia: PostListItem[];
	root: string;
};

/**
 * Prepares site-owned pages and plain-text outputs.
 *
 * @param assets - Bundled site assets referenced by generated pages.
 * @param posts - Prebuilt blog posts shared with coordinated outputs.
 * @param showcase - Prebuilt showcase entries.
 * @param externalMedia - Curated media shared with the media feed.
 * @param root - Repository root used for source loading and Git metadata.
 * @returns Pages and plain-text files for the framework host writer.
 */
export async function prerenderPages({
	assets,
	posts,
	showcase,
	externalMedia,
	root,
}: PrerenderPagesOptions): Promise<OxContentCustomHostRoute[]> {
	const dotfiles = await fetchDotfilesReadme(fetch);
	const contentAssets = await planSiteContentAssets(
		root,
		new Set(posts.filter((post) => post.isPublished === true).map((post) => post.filename)),
	);
	const assetUrls = collectionAssetUrls(contentAssets);
	const renderedPosts = posts.map((post) => ({
		...post,
		html: rewriteCollectionAssetUrls({
			html: post.html,
			pagePath: `/blog/${post.filename}/`,
			manifest: contentAssets,
		}).html,
	}));
	const renderedShowcase = showcase.map((project) => ({
		...project,
		image:
			project.image == null
				? undefined
				: (assetUrls.get(new URL(project.image, 'https://content.invalid').pathname) ??
					project.image),
	}));
	const publishedPosts = renderedPosts.filter((post) => post.isPublished);
	return Promise.all(
		createPageRoutes({ posts: publishedPosts, dotfiles })
			.filter((route) => !route.devOnly)
			.map(async (route) => {
				const result = await route.render({
					...createPageContext(root, assets),
					loadBlogPost: async (slug) =>
						publishedPosts.find((post) => post.filename === slug) ?? null,
					loadBlogPostMetadata: async () => publishedPosts,
					loadBlogPostSource: async (slug) =>
						publishedPosts.find((post) => post.filename === slug)?.source ?? null,
					loadExternalMedia: async () => externalMedia,
					loadShowcase: async () => renderedShowcase,
				});
				return { path: route.path, render: () => result } satisfies OxContentCustomHostRoute;
			}),
	);
}

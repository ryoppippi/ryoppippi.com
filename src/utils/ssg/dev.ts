import type {
	OxContentCustomHostModule,
	OxContentCustomHostRoute,
} from '@ox-content/vite-plugin/custom-host';
import { createPageMarkdownRenderer } from './markdown.ts';
import { resolveDevSiteAssets } from '@/components/SiteLayout/assets.ts';
import { loadBlogPostMetadata } from '@/pages/blog/data.ts';
import { fetchDotfilesReadme } from '@/pages/dotfiles/data.ts';
import { createPageRoutes } from './route.ts';
import { createPageContext } from './context.ts';
import { loadExternalMedia } from '@/pages/works/media/data.ts';
import { blogFeedItems } from '@/pages/blog/feed.ts';
import { mediaFeedItems } from '@/pages/works/media/feed.ts';

const host = {
	async outputs(context) {
		const [posts, media] = await Promise.all([
			context.memo('blog-metadata', loadBlogPostMetadata),
			loadExternalMedia(context.root),
		]);
		return { collections: { blog: blogFeedItems(posts), media: mediaFeedItems(media) } };
	},
	async routes(context) {
		const [posts, dotfiles] = await Promise.all([
			context.memo('blog-metadata', loadBlogPostMetadata),
			fetchDotfilesReadme(fetch),
		]);
		return createPageRoutes({ posts, dotfiles }).map(
			(route) =>
				({
					...route,
					render(context) {
						const assets = resolveDevSiteAssets(context.assets);
						return route.render({
							...createPageContext(
								context.root,
								assets,
								createPageMarkdownRenderer(context, assets),
							),
							loadBlogPostMetadata: () => posts,
						});
					},
				}) satisfies OxContentCustomHostRoute,
		);
	},
} satisfies OxContentCustomHostModule;

export default host;

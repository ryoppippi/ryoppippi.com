import type { OxContentCustomHostRoutesContext } from '@ox-content/vite-plugin/custom-host';
import type { OxContentCustomHostModule } from '@ox-content/vite-plugin/custom-host';
import { loadBlogPosts } from '@/pages/blog/data.ts';
import { loadShowcase } from '@/pages/works/showcase/data.ts';
import { createPageMarkdownRenderer } from './markdown.ts';
import { loadExternalMedia } from '@/pages/works/media/data.ts';
import { resolveSiteAssets } from '@/components/SiteLayout/assets.ts';
import { inlineBuiltHomeStyles } from './home-styles.ts';
import { blogFeedItems } from '@/pages/blog/feed.ts';
import { mediaFeedItems } from '@/pages/works/media/feed.ts';
import { prerenderPages } from '@/utils/ssg/prerender.ts';

function loadHostContent(context: OxContentCustomHostRoutesContext) {
	return context.memo('site-content', async () => {
		const renderContent = createPageMarkdownRenderer(context);
		const [posts, showcase, externalMedia] = await Promise.all([
			loadBlogPosts(renderContent),
			loadShowcase(renderContent),
			loadExternalMedia(context.root),
		]);
		return { posts, showcase, externalMedia, renderContent };
	});
}

const host = {
	async routes(context) {
		const { root } = context;
		const { posts, showcase, externalMedia, renderContent } = await loadHostContent(context);
		const contentAssets = await context.assets.collectionManifest();
		if (contentAssets == null) throw new Error('The site requires a collection asset snapshot');
		const islandModules = [
			...new Set(
				posts
					.filter(({ isPublished }) => isPublished)
					.flatMap(({ clientModules }) => clientModules.map(({ moduleId }) => moduleId)),
			),
		];
		return prerenderPages({
			renderContent,
			contentAssets,
			assets: await inlineBuiltHomeStyles(
				context.assets,
				resolveSiteAssets(context.assets, islandModules),
			),
			posts,
			showcase,
			externalMedia,
			root,
		});
	},
	async outputs(context) {
		const { posts, externalMedia } = await loadHostContent(context);
		return {
			collections: { blog: blogFeedItems(posts), media: mediaFeedItems(externalMedia) },
		};
	},
} satisfies OxContentCustomHostModule;

export default host;

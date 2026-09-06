import type { OxContentCustomHostRoutesContext } from '@ox-content/vite-plugin/custom-host';
import type { OxContentCustomHostModule } from '@ox-content/vite-plugin/custom-host';
import { loadBlogPosts } from '@/pages/blog/data.ts';
import { loadShowcase } from '@/pages/works/showcase/data.ts';
import { renderMarkdown, type MarkdownRenderer } from '@/ox-content/markdown.ts';
import { createIslandRenderer } from '@/ox-content/island-renderer.ts';
import { loadExternalMedia } from '@/pages/works/media/data.ts';
import { resolveSiteAssets } from '@/components/SiteLayout/assets.ts';
import { inlineBuiltHomeStyles } from '@/pages/home/styles.ts';
import { blogFeedItems } from '@/pages/blog/feed.ts';
import { mediaFeedItems } from '@/pages/works/media/feed.ts';
import { prerenderPages } from '@/pages/prerender.ts';

type HostContentContext = Pick<OxContentCustomHostRoutesContext, 'loadModule' | 'memo' | 'root'>;

function loadHostContent(context: HostContentContext) {
	return context.memo('site-content', async () => {
		const renderIsland = createIslandRenderer((id) => context.loadModule(id));
		const renderContent = ((content, options) =>
			renderMarkdown(content, { ...options, renderIsland })) satisfies MarkdownRenderer;
		const [posts, showcase, externalMedia] = await Promise.all([
			loadBlogPosts(renderContent),
			loadShowcase(renderContent),
			loadExternalMedia(context.root),
		]);
		return { posts, showcase, externalMedia };
	});
}

const host = {
	async routes(context) {
		const { outDir, root } = context;
		const { posts, showcase, externalMedia } = await loadHostContent(context);
		const islandModules = [
			...new Set(
				posts
					.filter(({ isPublished }) => isPublished)
					.flatMap(({ clientModules }) => clientModules.map(({ moduleId }) => moduleId)),
			),
		];
		return prerenderPages({
			assets: await inlineBuiltHomeStyles(outDir, resolveSiteAssets(context.assets, islandModules)),
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

import type { OxContentCustomHostRoutesContext } from '@ox-content/vite-plugin/custom-host';
import type { ContentArtifact } from '@/generation/content-types.ts';
import type { PostListItem } from '@/pages/post-list.ts';
import type { OxContentCustomHostModule } from '@ox-content/vite-plugin/custom-host';
import { buildContentArtifact } from '@/generation/content.ts';
import { createIslandRenderer } from '@/ox-content/island-renderer.ts';
import { loadExternalMedia } from '@/pages/works/media/data.ts';
import { resolveSiteAssets } from '@/components/SiteLayout/assets.ts';
import { inlineBuiltHomeStyles } from '@/pages/home/styles.ts';
import { blogFeedItems } from '@/pages/blog/feed.ts';
import { mediaFeedItems } from '@/pages/works/media/feed.ts';
import { generateStaticSite } from './generate-static-site.ts';

type HostContent = {
	content: ContentArtifact;
	externalMedia: PostListItem[];
};

type HostContentContext = Pick<OxContentCustomHostRoutesContext, 'loadModule' | 'memo' | 'root'>;

function loadHostContent(context: HostContentContext): Promise<HostContent> {
	return context.memo('site-content', async () => {
		const [content, externalMedia] = await Promise.all([
			buildContentArtifact(createIslandRenderer((id) => context.loadModule(id))),
			loadExternalMedia(context.root),
		]);
		return { content, externalMedia };
	});
}

const host = {
	async routes(context) {
		const { outDir, root } = context;
		const { content, externalMedia } = await loadHostContent(context);
		const islandModules = [
			...new Set(
				content.posts
					.filter(({ isPublished }) => isPublished)
					.flatMap(({ clientModules }) => clientModules.map(({ moduleId }) => moduleId)),
			),
		];
		return generateStaticSite({
			assets: await inlineBuiltHomeStyles(outDir, resolveSiteAssets(context.assets, islandModules)),
			content,
			externalMedia,
			root,
		});
	},
	async outputs(context) {
		const { content, externalMedia } = await loadHostContent(context);
		return {
			collections: { blog: blogFeedItems(content.posts), media: mediaFeedItems(externalMedia) },
		};
	},
} satisfies OxContentCustomHostModule;

export default host;

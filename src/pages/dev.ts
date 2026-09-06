import type { MarkdownDevHost, MarkdownDevRoute } from '@/ox-content/dev-plugin.ts';
import { resolveDevSiteAssets } from '@/components/SiteLayout/assets.ts';
import { loadBlogPostMetadata } from './blog/data.ts';
import { fetchDotfilesReadme } from './dotfiles/data.ts';
import { createPageRoutes } from './route.ts';
import { createPageContext } from './context.ts';
import { createErrorPageFile } from './error/index.ts';

const host = {
	async routes() {
		const [posts, dotfiles] = await Promise.all([
			loadBlogPostMetadata(),
			fetchDotfilesReadme(fetch),
		]);
		return createPageRoutes({ posts, dotfiles }).map(
			(route) =>
				({
					...route,
					render(context) {
						const assets = resolveDevSiteAssets(context.assets);
						assets.islands = context.islandStylesheets;
						return route.render(createPageContext(context.root, assets, context.renderMarkdown));
					},
				}) satisfies MarkdownDevRoute,
		);
	},
	notFound(context) {
		if (context.request.headers.get('accept')?.includes('text/html') === true) {
			return {
				body: createErrorPageFile(resolveDevSiteAssets(context.assets)).content,
				contentType: 'text/html; charset=utf-8',
				status: 404,
			};
		}
		if (
			context.url.pathname.startsWith('/blog/') ||
			context.url.pathname.startsWith('/works/showcase/assets/')
		) {
			return new Response(null, { status: 404 });
		}
	},
} satisfies MarkdownDevHost;

export default host;

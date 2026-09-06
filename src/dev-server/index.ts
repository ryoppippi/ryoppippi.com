import type { MarkdownRenderer } from '@/ox-content/markdown.ts';
import type {
	OxContentCustomHostModule,
	OxContentCustomHostRenderContext,
	OxContentCustomHostRoute,
	OxContentCustomHostRoutesContext,
} from '@ox-content/vite-plugin/custom-host';
import type { PageContext } from '@/pages/context.ts';
import { resolveDevSiteAssets } from '@/components/SiteLayout/assets.ts';

type BlogModule = typeof import('@/pages/blog/data.ts');
type PageContextModule = typeof import('@/pages/context.ts');
type IslandModule = typeof import('@/ox-content/island-renderer.ts');
type MarkdownModule = typeof import('@/ox-content/markdown.ts');
type PageRoutesModule = typeof import('@/pages/route.ts');
type ErrorPageModule = typeof import('@/pages/error/index.ts');
type DotfilesModule = typeof import('@/pages/dotfiles/data.ts');

async function createDevelopmentRouteDependencies(
	context: OxContentCustomHostRenderContext,
): Promise<PageContext> {
	const root = context.root;
	const assets = resolveDevSiteAssets(context.assets);
	const renderContent = (async (content, options) => {
		const [markdown, islands] = await Promise.all([
			context.loadModule('/src/ox-content/markdown.ts') as Promise<MarkdownModule>,
			context.loadModule('/src/ox-content/island-renderer.ts') as Promise<IslandModule>,
		]);
		const renderIsland = islands.createIslandRenderer(async (modulePath) => {
			const module = await context.loadModule(modulePath);
			const result = context.assets.stylesheets({ modules: [modulePath] });
			if (result.diagnostics.length > 0) {
				throw new Error(result.diagnostics.map(({ message }) => message).join('\n'));
			}
			assets.islands[modulePath] = result.stylesheets;
			return module;
		});
		return markdown.renderMarkdown(content, { ...options, renderIsland });
	}) satisfies MarkdownRenderer;
	const pages = (await context.loadModule('/src/pages/context.ts')) as PageContextModule;
	return pages.createPageContext(root, assets, renderContent);
}

function createDevelopmentRoute(
	route: ReturnType<PageRoutesModule['createPageRoutes']>[number],
): OxContentCustomHostRoute {
	return {
		path: route.path,
		async render(context) {
			return route.render(await createDevelopmentRouteDependencies(context));
		},
	};
}

async function loadDevelopmentCatalogue(context: OxContentCustomHostRoutesContext) {
	const [blog, dotfilesModule, routes] = await Promise.all([
		context.loadModule('/src/pages/blog/data.ts') as Promise<BlogModule>,
		context.loadModule('/src/pages/dotfiles/data.ts') as Promise<DotfilesModule>,
		context.loadModule('/src/pages/route.ts') as Promise<PageRoutesModule>,
	]);
	const [posts, dotfiles] = await Promise.all([
		blog.loadBlogPostMetadata(),
		dotfilesModule.fetchDotfilesReadme(fetch),
	]);
	return routes.createPageRoutes({ posts, dotfiles }).map((route) => createDevelopmentRoute(route));
}

const host = {
	routes: loadDevelopmentCatalogue,
	async notFound(context) {
		if (context.request.headers.get('accept')?.includes('text/html') === true) {
			const page = (await context.loadModule('/src/pages/error/index.ts')) as ErrorPageModule;
			return {
				body: page.createErrorPageFile(resolveDevSiteAssets(context.assets)).content,
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
} satisfies OxContentCustomHostModule;

export default host;

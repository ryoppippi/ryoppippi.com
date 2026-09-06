import type { IslandRenderer, MarkdownRenderer } from '@/content/index.ts';
import type {
	OxContentCustomHostModule,
	OxContentCustomHostRenderContext,
	OxContentCustomHostRoute,
	OxContentCustomHostRoutesContext,
} from '@ox-content/vite-plugin/custom-host';
import type { PageContext } from '@/pages/context.ts';
import { resolveDevSiteAssets } from '@/rendering/site-assets.ts';

type BlogModule = typeof import('@/content/blog.ts');
type ShowcaseModule = typeof import('@/content/showcase.ts');
type ExternalContentModule = typeof import('@/content/external-content.ts');
type WorksDataModule = typeof import('@/content/works-data.ts');
type MarkdownModule = typeof import('@/content/markdown/render.ts');
type PageRoutesModule = typeof import('@/pages/route.ts');
type ErrorPageModule = typeof import('@/pages/error/index.ts');
type DotfilesModule = typeof import('@/lib/dotfiles.ts');

function createDevelopmentRouteDependencies(
	context: OxContentCustomHostRenderContext,
	dependencies: Set<string>,
): PageContext {
	const root = context.root;
	const assets = resolveDevSiteAssets(context.assets);
	const renderContent: MarkdownRenderer = async (content, options) => {
		const [markdown, islands] = await Promise.all([
			context.loadModule('/src/content/markdown/render.ts') as Promise<MarkdownModule>,
			context.loadModule('/src/content/island-renderer.ts') as Promise<{
				createIslandRenderer: (load: (path: string) => Promise<unknown>) => IslandRenderer;
			}>,
		]);
		const renderIsland = islands.createIslandRenderer(async (modulePath) => {
			const module = await context.loadModule(modulePath);
			const result = context.assets.stylesheets({ modules: [modulePath] });
			if (result.diagnostics.length > 0) {
				throw new Error(result.diagnostics.map(({ message }) => message).join('\n'));
			}
			assets.islands[modulePath] = result.stylesheets;
			for (const dependency of result.dependencies) {
				dependencies.add(dependency);
			}
			return module;
		});
		return markdown.renderMarkdown(content, { ...options, renderIsland });
	};
	const loadBlogModule = () => context.loadModule('/src/content/blog.ts') as Promise<BlogModule>;

	return {
		assets,
		loadBlogPost: async (slug) => (await loadBlogModule()).loadBlogPost(slug, renderContent),
		loadBlogPostMetadata: async () => (await loadBlogModule()).loadBlogPostMetadata(),
		loadBlogPostSource: async (slug) => (await loadBlogModule()).loadBlogPostSource(slug),
		loadExternalPosts: async () => {
			const externalContent = (await context.loadModule(
				'/src/content/external-content.ts',
			)) as ExternalContentModule;
			return externalContent.loadExternalPosts(root);
		},
		loadExternalMedia: async () => {
			const externalContent = (await context.loadModule(
				'/src/content/external-content.ts',
			)) as ExternalContentModule;
			return externalContent.loadExternalMedia(root);
		},
		loadOssProjects: async () => {
			const worksData = (await context.loadModule('/src/content/works-data.ts')) as WorksDataModule;
			return worksData.loadOssProjects(root);
		},
		loadPublications: async () => {
			const worksData = (await context.loadModule('/src/content/works-data.ts')) as WorksDataModule;
			return worksData.loadPublications(root);
		},
		loadShowcase: async () => {
			const showcase = (await context.loadModule('/src/content/showcase.ts')) as ShowcaseModule;
			return showcase.loadShowcase(renderContent);
		},
		loadTalks: async () => {
			const worksData = (await context.loadModule('/src/content/works-data.ts')) as WorksDataModule;
			return worksData.loadTalks();
		},
	};
}

function createDevelopmentRoute(
	route: ReturnType<PageRoutesModule['createPageRoutes']>[number],
): OxContentCustomHostRoute {
	return {
		path: route.path,
		async render(context) {
			const dependencies = new Set<string>();
			const result = await route.render(createDevelopmentRouteDependencies(context, dependencies));
			return result == null ? undefined : { ...result, dependencies: [...dependencies] };
		},
	};
}

async function loadDevelopmentCatalogue(context: OxContentCustomHostRoutesContext) {
	const [blog, dotfilesModule, routes] = await Promise.all([
		context.loadModule('/src/content/blog.ts') as Promise<BlogModule>,
		context.loadModule('/src/lib/dotfiles.ts') as Promise<DotfilesModule>,
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

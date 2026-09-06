import type {
	BlogPost,
	BlogPostMetadata,
	IslandRenderer,
	MarkdownRenderer,
	ShowcaseProject,
} from '@/content/index.ts';
import type {
	OxContentCustomHostModule,
	OxContentCustomHostRenderContext,
	OxContentCustomHostRoute,
	OxContentCustomHostRoutesContext,
} from '@ox-content/vite-plugin/custom-host';
import type {
	DevRoute,
	DevRouteCatalogue,
	DevRouteDependencies,
	DevRouteResponse,
} from './route-types.ts';
import type { PostListItem } from '@/contents/external-content.ts';
import type { OssProject, Talk } from '@/contents/works-data.ts';
import type { SiteAssets } from '@/rendering/site-assets.ts';
import { DEV_ASSETS } from '@/rendering/site-assets.ts';

type BlogModule = {
	loadBlogPost: (slug: string, renderContent?: MarkdownRenderer) => Promise<BlogPost | null>;
	loadBlogPostMetadata: () => Promise<BlogPostMetadata[]>;
	loadBlogPostSource: (slug: string) => Promise<string | null>;
};

type ShowcaseModule = {
	loadShowcase: (renderContent?: MarkdownRenderer) => Promise<ShowcaseProject[]>;
};

type ExternalContentModule = {
	loadExternalMedia: (root: string) => Promise<PostListItem[]>;
	loadExternalPosts: (root: string) => Promise<PostListItem[]>;
};

type WorksDataModule = {
	loadOssProjects: (root: string) => Promise<OssProject[]>;
	loadPublications: (root: string) => ReturnType<DevRouteDependencies['loadPublications']>;
	loadTalks: () => Promise<Talk[]>;
};

type MarkdownModule = {
	renderMarkdown: (
		content: string,
		options: NonNullable<Parameters<MarkdownRenderer>[1]> & {
			renderIsland: IslandRenderer;
		},
	) => ReturnType<MarkdownRenderer>;
};

type DevRoutesModule = {
	createDevRoutes: (catalogue: DevRouteCatalogue) => DevRoute[];
	renderDevNotFound: (assets: SiteAssets) => DevRouteResponse;
};

type DotfilesModule = {
	fetchDotfilesReadme: (fetchImplementation: typeof fetch) => Promise<string>;
};

function createDevelopmentRouteDependencies(
	context: OxContentCustomHostRenderContext,
	dependencies: Set<string>,
): DevRouteDependencies {
	const root = context.root;
	const assets: SiteAssets = { ...DEV_ASSETS, islands: {} };
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
				'/src/contents/external-content.ts',
			)) as ExternalContentModule;
			return externalContent.loadExternalPosts(root);
		},
		loadExternalMedia: async () => {
			const externalContent = (await context.loadModule(
				'/src/contents/external-content.ts',
			)) as ExternalContentModule;
			return externalContent.loadExternalMedia(root);
		},
		loadOssProjects: async () => {
			const worksData = (await context.loadModule(
				'/src/contents/works-data.ts',
			)) as WorksDataModule;
			return worksData.loadOssProjects(root);
		},
		loadPublications: async () => {
			const worksData = (await context.loadModule(
				'/src/contents/works-data.ts',
			)) as WorksDataModule;
			return worksData.loadPublications(root);
		},
		loadShowcase: async () => {
			const showcase = (await context.loadModule('/src/content/showcase.ts')) as ShowcaseModule;
			return showcase.loadShowcase(renderContent);
		},
		loadTalks: async () => {
			const worksData = (await context.loadModule(
				'/src/contents/works-data.ts',
			)) as WorksDataModule;
			return worksData.loadTalks();
		},
	};
}

function createDevelopmentRoute(route: DevRoute): OxContentCustomHostRoute {
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
		context.loadModule('/src/dev-server/routes.ts') as Promise<DevRoutesModule>,
	]);
	const [posts, dotfiles] = await Promise.all([
		blog.loadBlogPostMetadata(),
		dotfilesModule.fetchDotfilesReadme(fetch),
	]);
	return routes.createDevRoutes({ posts, dotfiles }).map((route) => createDevelopmentRoute(route));
}

const host = {
	routes: loadDevelopmentCatalogue,
	async notFound(context) {
		if (context.request.headers.get('accept')?.includes('text/html') === true) {
			const routes = (await context.loadModule('/src/dev-server/routes.ts')) as DevRoutesModule;
			return routes.renderDevNotFound(DEV_ASSETS);
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

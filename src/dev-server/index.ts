import type {
	BlogPost,
	BlogPostMetadata,
	IslandRenderer,
	MarkdownRenderer,
	ShowcaseProject,
} from '@/content/index.ts';
import type { DevRouteDependencies, DevRouteResponse } from './routes.ts';
import type { PostListItem } from '@/contents/external-content.ts';
import type { OssProject, Talk } from '@/contents/works-data.ts';
import type { SiteAssets } from '@/rendering/site-assets.ts';
import type { ViteDevServer } from 'vite';
import { createCollectionAssetsMiddleware } from '@ox-content/vite-plugin';
import { resolveSolidIslandStylesheets } from '@ox-content/vite-plugin-solid';
import path from 'node:path';
import { withoutLeadingSlash } from 'ufo';
import { isSiteContentAssetSource, planSiteContentAssets } from '@/generation/content-assets.ts';
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
	renderDevNotFound: (assets: SiteAssets) => DevRouteResponse;
	renderDevRoute: (
		pathname: string,
		dependencies: DevRouteDependencies,
	) => Promise<DevRouteResponse | null>;
};

/**
 * Resolves which generated development routes depend on a changed source file.
 *
 * @param relativeFile - Source path relative to the Vite project root.
 * @returns Affected routes, every route, or null when Vite handles the file directly.
 */
export function invalidatedRoutes(relativeFile: string): '*' | string[] | null {
	const file = relativeFile.replaceAll('\\', '/');
	const blogMatch = /^src\/content\/blog\/([^/]+)(?:\/index\.mdx?|\.mdx?|\/.*)$/.exec(file);
	if (blogMatch != null) {
		return ['/blog/', '/feed.xml', `/blog/${blogMatch[1]}/`, `/blog/${blogMatch[1]}.md`];
	}
	if (
		file === 'src/contents/external-rss/rss.json' ||
		file === 'src/contents/external-rss/posts.json'
	) {
		return ['/blog/'];
	}
	if (file === 'src/contents/external-rss/media.json') {
		return ['/works/media/', '/works/media/feed.xml'];
	}
	if (file === 'src/contents/works/oss/list.json') {
		return ['/works/oss/'];
	}
	if (file === 'src/contents/works/oss/stars.json') {
		return ['/works/oss/'];
	}
	if (file === 'src/contents/publication.json') {
		return ['/works/publications/'];
	}
	if (file.startsWith('src/content/showcase/')) {
		return ['/works/showcase/'];
	}
	if (
		file.startsWith('src/content/') ||
		file.startsWith('src/lib/') ||
		file.startsWith('src/client/') ||
		file.startsWith('src/components/') ||
		file.startsWith('src/config/') ||
		file.startsWith('src/generation/') ||
		file.startsWith('src/pages/') ||
		file.startsWith('src/rendering/') ||
		file.startsWith('src/styles/') ||
		file === 'src/contents/external-content.ts' ||
		file === 'src/contents/works-data.ts' ||
		file === 'src/dev-server/routes.ts'
	) {
		return '*';
	}
	return null;
}

/**
 * Collects the dev URLs of the stylesheets an island needs, its own and those
 * of the components it pulls in.
 *
 * The production build reads this from the Vite manifest; in development the
 * SSR module graph is the equivalent, and it is already populated because the
 * island has just been server-rendered.
 */
async function islandStyleHrefs(server: ViteDevServer, url: string): Promise<string[]> {
	const entry = await server.moduleGraph.getModuleByUrl(url, true);
	if (entry == null) {
		return [];
	}

	const result = resolveSolidIslandStylesheets({
		modules: [entry.id ?? url],
		moduleGraph: server.moduleGraph,
	});
	if (result.diagnostics.length > 0) {
		throw new Error(result.diagnostics.map(({ message }) => message).join('\n'));
	}
	return result.stylesheets.map(({ href }) => withoutLeadingSlash(href));
}

function createDevelopmentRouteDependencies(server: ViteDevServer): DevRouteDependencies {
	const root = server.config.root;
	// Rebuilt as islands render so a page links the styles of the islands it
	// actually mounts, the way the built site does from the manifest.
	const assets: SiteAssets = { ...DEV_ASSETS, islands: {} };
	const renderContent: MarkdownRenderer = async (content, options) => {
		const [markdown, islands] = await Promise.all([
			server.ssrLoadModule('/src/content/markdown/render.ts') as Promise<MarkdownModule>,
			server.ssrLoadModule('/src/content/island-renderer.ts') as Promise<{
				createIslandRenderer: (load: (path: string) => Promise<unknown>) => IslandRenderer;
			}>,
		]);
		const { createIslandRenderer } = islands;
		const renderIsland = createIslandRenderer(async (modulePath) => {
			const module = await server.ssrLoadModule(modulePath);
			assets.islands[modulePath] = await islandStyleHrefs(server, modulePath);
			return module;
		});
		return markdown.renderMarkdown(content, { ...options, renderIsland });
	};
	const loadBlogModule = () => server.ssrLoadModule('/src/content/blog.ts') as Promise<BlogModule>;

	return {
		assets,
		loadBlogPost: async (slug) => (await loadBlogModule()).loadBlogPost(slug, renderContent),
		loadBlogPostMetadata: async () => (await loadBlogModule()).loadBlogPostMetadata(),
		loadBlogPostSource: async (slug) => (await loadBlogModule()).loadBlogPostSource(slug),
		loadDotfiles: async () => {
			const dotfiles = (await server.ssrLoadModule('/src/lib/dotfiles.ts')) as {
				fetchDotfilesReadme: (fetchImplementation: typeof fetch) => Promise<string>;
			};
			return dotfiles.fetchDotfilesReadme(fetch);
		},
		loadExternalPosts: async () => {
			const externalContent = (await server.ssrLoadModule(
				'/src/contents/external-content.ts',
			)) as ExternalContentModule;
			return externalContent.loadExternalPosts(root);
		},
		loadExternalMedia: async () => {
			const externalContent = (await server.ssrLoadModule(
				'/src/contents/external-content.ts',
			)) as ExternalContentModule;
			return externalContent.loadExternalMedia(root);
		},
		loadOssProjects: async () => {
			const worksData = (await server.ssrLoadModule(
				'/src/contents/works-data.ts',
			)) as WorksDataModule;
			return worksData.loadOssProjects(root);
		},
		loadPublications: async () => {
			const worksData = (await server.ssrLoadModule(
				'/src/contents/works-data.ts',
			)) as WorksDataModule;
			return worksData.loadPublications(root);
		},
		loadShowcase: async () => {
			const showcase = (await server.ssrLoadModule('/src/content/showcase.ts')) as ShowcaseModule;
			return showcase.loadShowcase(renderContent);
		},
		loadTalks: async () => {
			const worksData = (await server.ssrLoadModule(
				'/src/contents/works-data.ts',
			)) as WorksDataModule;
			return worksData.loadTalks();
		},
	};
}

/**
 * Configures the development server for custom static-site routes.
 *
 * @param server - Vite development server used for module loading and middleware.
 * @returns Nothing.
 */
export async function configureStaticSiteDevelopmentServer(server: ViteDevServer): Promise<void> {
	const dependencies = createDevelopmentRouteDependencies(server);
	const cache = new Map<string, Promise<DevRouteResponse | null>>();
	let contentAssetsMiddleware = planSiteContentAssets(server.config.root).then(
		createCollectionAssetsMiddleware,
	);
	let timer: ReturnType<typeof setTimeout> | undefined;

	server.watcher.on('all', (_event, file) => {
		if (isSiteContentAssetSource(file)) {
			contentAssetsMiddleware = planSiteContentAssets(server.config.root).then(
				createCollectionAssetsMiddleware,
			);
		}
		const routes = invalidatedRoutes(path.relative(server.config.root, file));
		if (routes == null) {
			return;
		}
		if (routes === '*') {
			cache.clear();
		} else {
			for (const route of routes) {
				cache.delete(route);
			}
		}
		clearTimeout(timer);
		timer = setTimeout(() => server.ws.send({ type: 'full-reload' }), 80);
	});

	server.middlewares.use(async (request, response, next) => {
		try {
			await (
				await contentAssetsMiddleware
			)(request, response, next);
		} catch (error) {
			next(error);
		}
	});

	server.middlewares.use(async (request, response, next) => {
		let pathname: string | undefined;
		let rendered: Promise<DevRouteResponse | null> | undefined;
		try {
			if (request.method !== 'GET' || request.url == null) {
				next();
				return;
			}

			const url = new URL(request.url, 'http://localhost');
			pathname = url.pathname;
			rendered = cache.get(url.pathname);
			let routesModule: DevRoutesModule | undefined;
			if (rendered == null) {
				routesModule = (await server.ssrLoadModule('/src/dev-server/routes.ts')) as DevRoutesModule;
				rendered = routesModule.renderDevRoute(url.pathname, dependencies);
				cache.set(url.pathname, rendered);
			}
			let result = await rendered;
			if (result == null) {
				cache.delete(url.pathname);
				if (request.headers.accept?.includes('text/html') === true) {
					routesModule ??= (await server.ssrLoadModule(
						'/src/dev-server/routes.ts',
					)) as DevRoutesModule;
					result = routesModule.renderDevNotFound(DEV_ASSETS);
				} else if (
					url.pathname.startsWith('/blog/') ||
					url.pathname.startsWith('/works/showcase/assets/')
				) {
					response.statusCode = 404;
					response.end();
					return;
				}
			}
			if (result == null) {
				next();
				return;
			}

			response.statusCode = result.status;
			response.setHeader('Content-Type', result.contentType);
			response.end(
				result.contentType.startsWith('text/html')
					? await server.transformIndexHtml(url.pathname, result.body)
					: result.body,
			);
		} catch (error) {
			// Failed renders must be retryable, without evicting a newer in-flight response.
			if (pathname != null && cache.get(pathname) === rendered) {
				cache.delete(pathname);
			}
			next(error);
		}
	});
}

if (import.meta.vitest != null) {
	it('returns a server error and retries a transient route failure', async () => {
		const { createServer } = await import('vite');
		const { createServer: createHttpServer } = await import('node:http');
		const server = await createServer({
			configFile: false,
			appType: 'custom',
			logLevel: 'silent',
			server: { middlewareMode: true },
		});
		let attempts = 0;
		using _loader = vi.spyOn(server, 'ssrLoadModule').mockResolvedValue({
			renderDevRoute: async () => {
				if (attempts++ === 0) throw new Error('Transient render failure');
				return { status: 200, contentType: 'text/plain', body: 'Recovered' };
			},
			renderDevNotFound: () => ({ status: 404, contentType: 'text/plain', body: 'Missing' }),
		} satisfies DevRoutesModule);
		const http = createHttpServer(server.middlewares);
		try {
			await configureStaticSiteDevelopmentServer(server);
			await new Promise<void>((resolve) => http.listen(0, '127.0.0.1', resolve));
			const address = http.address();
			assert(address != null && typeof address !== 'string');
			const url = `http://127.0.0.1:${address.port}/retry-fixture`;
			const failed = await fetch(url, { signal: AbortSignal.timeout(2_000) });
			expect(failed.status).toBe(500);
			await failed.text();
			const recovered = await fetch(url, { signal: AbortSignal.timeout(2_000) });
			expect(recovered.status).toBe(200);
			expect(await recovered.text()).toBe('Recovered');
		} finally {
			http.closeAllConnections();
			await new Promise<void>((resolve) => http.close(() => resolve()));
			await server.close();
		}
	});

	describe(invalidatedRoutes, () => {
		it('invalidates only an edited article and its indexes', () => {
			expect(invalidatedRoutes('src/content/blog/2026-06-22/index.md')).toEqual([
				'/blog/',
				'/feed.xml',
				'/blog/2026-06-22/',
				'/blog/2026-06-22.md',
			]);
		});

		it('invalidates an edited MDX article and its indexes', () => {
			expect(invalidatedRoutes('src/content/blog/2026-06-23/index.mdx')).toEqual([
				'/blog/',
				'/feed.xml',
				'/blog/2026-06-23/',
				'/blog/2026-06-23.md',
			]);
		});

		it('invalidates all rendered pages for Markdown pipeline changes', () => {
			expect(invalidatedRoutes('src/content/markdown/render.ts')).toBe('*');
		});

		it.each([
			'src/content/blog.ts',
			'src/content/islands.ts',
			'src/content/island-renderer.ts',
			'src/content/showcase.ts',
			'src/lib/dotfiles.ts',
		])('invalidates rendered pages when shared loader %s changes', (file) => {
			expect(invalidatedRoutes(file)).toBe('*');
		});

		it('invalidates all rendered pages for head metadata changes', () => {
			expect(invalidatedRoutes('src/rendering/page-head.ts')).toBe('*');
			expect(invalidatedRoutes('src/config/site.ts')).toBe('*');
			expect(invalidatedRoutes('src/config/redirects.ts')).toBe('*');
		});

		it('invalidates the OSS page when its star snapshot changes', () => {
			expect(invalidatedRoutes('src/contents/works/oss/stars.json')).toEqual(['/works/oss/']);
		});

		it('invalidates the media page when curated media changes', () => {
			expect(invalidatedRoutes('src/contents/external-rss/media.json')).toEqual([
				'/works/media/',
				'/works/media/feed.xml',
			]);
		});

		it('ignores client assets handled by Vite', () => {
			expect(invalidatedRoutes('public/ryoppippi.jpg')).toBeNull();
		});
	});
}

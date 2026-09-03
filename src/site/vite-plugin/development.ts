import type {
	BlogPost,
	BlogPostMetadata,
	IslandRenderer,
	MarkdownRenderer,
	ShowcaseProject,
} from '../../content/index.ts';
import type { DevRouteDependencies, DevRouteResponse } from '../dev-routes.ts';
import type { PostListItem } from '../content.ts';
import type { OssProject, Talk } from '../sections.ts';
import type { SiteAssets } from '../assets.ts';
import type { Plugin, ViteDevServer } from 'vite';
import { blogDirectory, showcaseDirectory } from '../../content/paths.ts';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { DEV_ASSETS } from '../assets.ts';

type BlogModule = {
	loadBlogPost: (slug: string, renderContent?: MarkdownRenderer) => Promise<BlogPost | null>;
	loadBlogPostMetadata: () => Promise<BlogPostMetadata[]>;
	loadBlogPostSource: (slug: string) => Promise<string | null>;
};

type ShowcaseModule = {
	loadShowcase: (renderContent?: MarkdownRenderer) => Promise<ShowcaseProject[]>;
};

type SiteContentModule = {
	loadExternalMedia: (root: string) => Promise<PostListItem[]>;
	loadExternalPosts: (root: string) => Promise<PostListItem[]>;
};

type SectionsModule = {
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
	) => Promise<string>;
};

type DevRoutesModule = {
	renderDevNotFound: (assets: SiteAssets) => DevRouteResponse;
	renderDevRoute: (
		pathname: string,
		dependencies: DevRouteDependencies,
	) => Promise<DevRouteResponse | null>;
};

function contentTypeForFile(file: string): string {
	const extension = path.extname(file);
	return (
		{
			'.avif': 'image/avif',
			'.gif': 'image/gif',
			'.jpeg': 'image/jpeg',
			'.jpg': 'image/jpeg',
			'.png': 'image/png',
			'.svg': 'image/svg+xml',
			'.webp': 'image/webp',
		}[extension] ?? 'application/octet-stream'
	);
}

async function readContentAsset(pathname: string): Promise<{ body: Buffer; type: string } | null> {
	const decoded = decodeURIComponent(pathname);
	if (decoded.includes('..')) {
		return null;
	}

	const blogMatch = /^\/blog\/([^/]+)\/(.+)$/.exec(decoded);
	const showcaseMatch = /^\/works\/showcase\/assets\/([^/]+)$/.exec(decoded);
	const file =
		blogMatch == null
			? showcaseMatch == null
				? null
				: path.join(showcaseDirectory(), showcaseMatch[1])
			: path.join(blogDirectory(), blogMatch[1], blogMatch[2]);
	if (file == null || path.extname(file).length === 0) {
		return null;
	}

	try {
		return { body: await readFile(file), type: contentTypeForFile(file) };
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
			return null;
		}
		throw error;
	}
}

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
		file.startsWith('src/content/markdown/') ||
		file.startsWith('src/site/components/') ||
		file.startsWith('src/site/pages/') ||
		/^src\/site\/(assets|client|consts|content|dev-routes|generated-file|head|html|page-style-loader|page-style-registry|redirects|sections|style)\.(?:css|ts)$/.test(
			file,
		)
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

	const hrefs: string[] = [];
	const seen = new Set<string>();
	const visit = async (node: typeof entry): Promise<void> => {
		const file = node.id?.split('?')[0];
		if (file == null || seen.has(file)) {
			return;
		}

		seen.add(file);
		if (file.endsWith('.css')) {
			hrefs.push(path.relative(server.config.root, file).replaceAll(path.sep, '/'));
		}
		for (const imported of node.importedModules) {
			await visit(imported);
		}
	};
	await visit(entry);

	return hrefs;
}

function createDevRouteDependencies(server: ViteDevServer): DevRouteDependencies {
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
			assets.islands[modulePath.replace('/src/content/blog/', '')] = await islandStyleHrefs(
				server,
				modulePath,
			);
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
			const content = (await server.ssrLoadModule('/src/site/content.ts')) as SiteContentModule;
			return content.loadExternalPosts(root);
		},
		loadExternalMedia: async () => {
			const content = (await server.ssrLoadModule('/src/site/content.ts')) as SiteContentModule;
			return content.loadExternalMedia(root);
		},
		loadOssProjects: async () => {
			const sections = (await server.ssrLoadModule('/src/site/sections.ts')) as SectionsModule;
			return sections.loadOssProjects(root);
		},
		loadPublications: async () => {
			const sections = (await server.ssrLoadModule('/src/site/sections.ts')) as SectionsModule;
			return sections.loadPublications(root);
		},
		loadShowcase: async () => {
			const showcase = (await server.ssrLoadModule('/src/content/showcase.ts')) as ShowcaseModule;
			return showcase.loadShowcase(renderContent);
		},
		loadTalks: async () => {
			const sections = (await server.ssrLoadModule('/src/site/sections.ts')) as SectionsModule;
			return sections.loadTalks();
		},
	};
}

/**
 * Creates the development half of the static-site Vite integration.
 *
 * @returns The Vite plugin that renders static-site routes during development.
 */
export function staticSiteDevelopmentPlugin(): Plugin {
	return {
		name: 'ryoppippi-static-site-development',
		apply: (_config, { command, mode }) => command === 'serve' && mode !== 'test',
		configureServer(server: ViteDevServer) {
			const dependencies = createDevRouteDependencies(server);
			const cache = new Map<string, Promise<DevRouteResponse | null>>();
			let timer: ReturnType<typeof setTimeout> | undefined;

			server.watcher.on('all', (_event, file) => {
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
				if (request.method !== 'GET' || request.url == null) {
					next();
					return;
				}

				const url = new URL(request.url, 'http://localhost');
				const asset = await readContentAsset(url.pathname);
				if (asset != null) {
					response.statusCode = 200;
					response.setHeader('Content-Type', asset.type);
					response.end(asset.body);
					return;
				}

				let rendered = cache.get(url.pathname);
				let routesModule: DevRoutesModule | undefined;
				if (rendered == null) {
					routesModule = (await server.ssrLoadModule('/src/site/dev-routes.ts')) as DevRoutesModule;
					rendered = routesModule.renderDevRoute(url.pathname, dependencies);
					cache.set(url.pathname, rendered);
				}
				let result = await rendered;
				if (result == null) {
					cache.delete(url.pathname);
					if (request.headers.accept?.includes('text/html') === true) {
						routesModule ??= (await server.ssrLoadModule(
							'/src/site/dev-routes.ts',
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
			});
		},
	};
}

if (import.meta.vitest != null) {
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

		it('invalidates all rendered pages for head metadata changes', () => {
			expect(invalidatedRoutes('src/site/head.ts')).toBe('*');
			expect(invalidatedRoutes('src/site/consts.ts')).toBe('*');
			expect(invalidatedRoutes('src/site/redirects.ts')).toBe('*');
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
			expect(invalidatedRoutes('static/ryoppippi.jpg')).toBeNull();
		});
	});
}

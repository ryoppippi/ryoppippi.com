import type {
	BlogPost,
	BlogPostMetadata,
	BlogIslandModuleLoader,
	BlogIslandSsrRenderer,
	PostListItem,
} from '../pages/blog/index.ts';
import type {
	ContentMarkdownRenderOptions,
	ContentMarkdownRenderer,
} from '../pages/blog/markdown.ts';
import type { OssProject } from '../pages/works/oss/index.ts';
import type { Publication } from '../pages/works/publications/index.ts';
import type { ShowcaseProject } from '../pages/works/showcase/index.ts';
import type { Talk } from '../pages/works/talks/index.ts';
import type { DevRouteDependencies, DevRouteResponse } from './dev-routes.ts';
import type { SiteAssets } from './assets.ts';
import type { Plugin, ViteDevServer } from 'vite';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { DEV_ASSETS } from './assets.ts';

const contentDirectory = path.resolve(import.meta.dirname, '../content');
const blogDirectory = path.join(contentDirectory, 'blog');
const showcaseDirectory = path.join(contentDirectory, 'showcase');

type BlogModule = {
	loadBlogPost: (slug: string, renderContent?: ContentMarkdownRenderer) => Promise<BlogPost | null>;
	loadBlogPostMetadata: () => Promise<BlogPostMetadata[]>;
	loadBlogPostSource: (slug: string) => Promise<string | null>;
	loadExternalPosts: (root: string) => Promise<PostListItem[]>;
};

type MediaModule = {
	loadExternalMedia: (root: string) => Promise<PostListItem[]>;
};

type OssModule = {
	loadOssProjects: (root: string) => Promise<OssProject[]>;
};

type PublicationsModule = {
	loadPublications: (root: string) => Promise<Record<string, Publication[]>>;
};

type ShowcaseModule = {
	loadShowcase: (renderContent?: ContentMarkdownRenderer) => Promise<ShowcaseProject[]>;
};

type TalksModule = {
	loadTalks: () => Promise<Talk[]>;
};

type MarkdownModule = {
	renderContentMarkdown: (
		content: string,
		options: Omit<ContentMarkdownRenderOptions, 'islandSsr'> & {
			islandSsr: BlogIslandSsrRenderer;
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

function contentType(file: string): string {
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
				: path.join(showcaseDirectory, showcaseMatch[1])
			: path.join(blogDirectory, blogMatch[1], blogMatch[2]);
	if (file == null || path.extname(file).length === 0) {
		return null;
	}

	try {
		return { body: await readFile(file), type: contentType(file) };
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
			return null;
		}
		throw error;
	}
}

export function invalidatedRoutes(relativeFile: string): '*' | string[] | null {
	const file = relativeFile.replaceAll('\\', '/');
	const blogMatch = /^src\/content\/blog\/([^/]+)(?:\/index\.mdx?|\.mdx?|\/.*)$/.exec(file);
	if (blogMatch != null) {
		return ['/blog/', '/feed.xml', `/blog/${blogMatch[1]}/`, `/blog/${blogMatch[1]}.md`];
	}
	if (
		file === 'src/content/external-rss/rss.json' ||
		file === 'src/content/external-rss/posts.json'
	) {
		return ['/blog/'];
	}
	if (file === 'src/content/external-rss/media.json') {
		return ['/works/media/', '/works/media/feed.xml'];
	}
	if (file === 'src/content/works/oss/list.json') {
		return ['/works/oss/'];
	}
	if (file === 'src/content/works/oss/stars.json') {
		return ['/works/oss/'];
	}
	if (file === 'src/content/publication.json') {
		return ['/works/publications/'];
	}
	if (file.startsWith('src/content/showcase/')) {
		return ['/works/showcase/'];
	}
	if (
		file === 'routes.ts' ||
		file.startsWith('src/pages/') ||
		file.startsWith('src/site/templates/') ||
		/^src\/site\/(assets|client|consts|dev-routes|head|html|page-styles|style)\.(?:css|ts)$/.test(
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

function createDependencies(server: ViteDevServer): DevRouteDependencies {
	const root = server.config.root;
	// Rebuilt as islands render so a page links the styles of the islands it
	// actually mounts, the way the built site does from the manifest.
	const assets: SiteAssets = { ...DEV_ASSETS, islands: {} };
	const renderContent: ContentMarkdownRenderer = async (content, options) => {
		const [markdown, blogSsr] = await Promise.all([
			server.ssrLoadModule('/src/pages/blog/markdown.ts') as Promise<MarkdownModule>,
			server.ssrLoadModule('/src/pages/blog/index.ts') as Promise<{
				createBlogIslandSsrRenderer: (load: BlogIslandModuleLoader) => BlogIslandSsrRenderer;
			}>,
		]);
		const islandSsr = blogSsr.createBlogIslandSsrRenderer(async (modulePath) => {
			const module = await server.ssrLoadModule(modulePath);
			assets.islands[modulePath.replace('/src/content/blog/', '')] = await islandStyleHrefs(
				server,
				modulePath,
			);
			return module;
		});
		return markdown.renderContentMarkdown(content, { ...options, islandSsr });
	};
	const loadBlogModule = () =>
		server.ssrLoadModule('/src/pages/blog/index.ts') as Promise<BlogModule>;
	const loadMediaModule = () =>
		server.ssrLoadModule('/src/pages/works/media/index.ts') as Promise<MediaModule>;
	const loadOssModule = () =>
		server.ssrLoadModule('/src/pages/works/oss/index.ts') as Promise<OssModule>;
	const loadPublicationsModule = () =>
		server.ssrLoadModule('/src/pages/works/publications/index.ts') as Promise<PublicationsModule>;
	const loadShowcaseModule = () =>
		server.ssrLoadModule('/src/pages/works/showcase/index.ts') as Promise<ShowcaseModule>;
	const loadTalksModule = () =>
		server.ssrLoadModule('/src/pages/works/talks/index.ts') as Promise<TalksModule>;

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
			return (await loadBlogModule()).loadExternalPosts(root);
		},
		loadExternalMedia: async () => {
			return (await loadMediaModule()).loadExternalMedia(root);
		},
		loadOssProjects: async () => {
			return (await loadOssModule()).loadOssProjects(root);
		},
		loadPublications: async () => {
			return (await loadPublicationsModule()).loadPublications(root);
		},
		loadShowcase: async () => {
			return (await loadShowcaseModule()).loadShowcase(renderContent);
		},
		loadTalks: async () => {
			return (await loadTalksModule()).loadTalks();
		},
	};
}

export function staticSiteDevServer(): Plugin {
	return {
		name: 'ryoppippi-static-site-dev-server',
		apply: (_config, { command, mode }) => command === 'serve' && mode !== 'test',
		configureServer(server: ViteDevServer) {
			const dependencies = createDependencies(server);
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
			expect(invalidatedRoutes('src/pages/blog/markdown.ts')).toBe('*');
		});

		it('invalidates all rendered pages for head metadata changes', () => {
			expect(invalidatedRoutes('src/site/head.ts')).toBe('*');
			expect(invalidatedRoutes('src/site/consts.ts')).toBe('*');
		});

		it('invalidates the OSS page when its star snapshot changes', () => {
			expect(invalidatedRoutes('src/content/works/oss/stars.json')).toEqual(['/works/oss/']);
		});

		it('invalidates the media page when curated media changes', () => {
			expect(invalidatedRoutes('src/content/external-rss/media.json')).toEqual([
				'/works/media/',
				'/works/media/feed.xml',
			]);
		});

		it('ignores client assets handled by Vite', () => {
			expect(invalidatedRoutes('static/ryoppippi.jpg')).toBeNull();
		});
	});
}

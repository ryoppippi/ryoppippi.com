import type {
	BlogPost,
	BlogPostMetadata,
	MarkdownRenderer,
	ShowcaseProject,
	TweetRenderer,
} from '@ryoppippi/content';
import type { DevRouteDependencies, DevRouteResponse } from './dev-routes.ts';
import type { PostListItem } from './content.ts';
import type { OssProject, Talk } from './sections.ts';
import type { SiteAssets } from './assets.ts';
import type { Plugin, ViteDevServer } from 'vite';
import { blogDirectory, showcaseDirectory } from '@ryoppippi/content/paths';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { DEV_ASSETS } from './assets.ts';

type BlogModule = {
	loadBlogPost: (slug: string, renderContent?: MarkdownRenderer) => Promise<BlogPost | null>;
	loadBlogPostMetadata: () => Promise<BlogPostMetadata[]>;
	loadBlogPostSource: (slug: string) => Promise<string | null>;
};

type ShowcaseModule = {
	loadShowcase: (renderContent?: MarkdownRenderer) => Promise<ShowcaseProject[]>;
};

type SiteContentModule = {
	loadExternalPosts: (root: string) => Promise<PostListItem[]>;
};

type SectionsModule = {
	loadOssProjects: (root: string) => Promise<Record<string, OssProject[]>>;
	loadPublications: (root: string) => ReturnType<DevRouteDependencies['loadPublications']>;
	loadTalks: () => Promise<Talk[]>;
};

type MarkdownModule = {
	renderMarkdown: (content: string, options: { renderTweet: TweetRenderer }) => Promise<string>;
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
				: path.join(showcaseDirectory(), showcaseMatch[1])
			: path.join(blogDirectory(), blogMatch[1], blogMatch[2]);
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
	const blogMatch = /^packages\/content\/src\/blog\/([^/]+)(?:\/index\.md|\.md|\/.*)$/.exec(file);
	if (blogMatch != null) {
		return ['/blog/', '/feed.xml', `/blog/${blogMatch[1]}/`, `/blog/${blogMatch[1]}.md`];
	}
	if (file === 'src/contents/external-rss/rss.json') {
		return ['/blog/'];
	}
	if (file === 'src/contents/works/oss/list.json') {
		return ['/works/oss/'];
	}
	if (file === 'src/contents/publication.json') {
		return ['/works/publications/'];
	}
	if (file.startsWith('packages/content/src/showcase/')) {
		return ['/works/showcase/'];
	}
	if (
		file === 'routes.ts' ||
		file.startsWith('packages/content/src/markdown/') ||
		file.startsWith('src/site/templates/') ||
		/^src\/site\/(client|content|dev-routes|html|pages|secondary-pages|sections|style)\.(?:css|ts)$/.test(
			file,
		)
	) {
		return '*';
	}
	return null;
}

function createDependencies(server: ViteDevServer): DevRouteDependencies {
	const root = server.config.root;
	const renderContent = async (content: string) => {
		const [markdown, tweets] = await Promise.all([
			server.ssrLoadModule('/packages/content/src/markdown/render.ts') as Promise<MarkdownModule>,
			server.ssrLoadModule('/packages/content/src/tweet-renderer.ts') as Promise<{
				renderTweet: TweetRenderer;
			}>,
		]);
		return markdown.renderMarkdown(content, { renderTweet: tweets.renderTweet });
	};
	const loadBlogModule = () =>
		server.ssrLoadModule('/packages/content/src/blog.ts') as Promise<BlogModule>;

	return {
		assets: DEV_ASSETS,
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
		loadOssProjects: async () => {
			const sections = (await server.ssrLoadModule('/src/site/sections.ts')) as SectionsModule;
			return sections.loadOssProjects(root);
		},
		loadPublications: async () => {
			const sections = (await server.ssrLoadModule('/src/site/sections.ts')) as SectionsModule;
			return sections.loadPublications(root);
		},
		loadShowcase: async () => {
			const showcase = (await server.ssrLoadModule(
				'/packages/content/src/showcase.ts',
			)) as ShowcaseModule;
			return showcase.loadShowcase(renderContent);
		},
		loadTalks: async () => {
			const sections = (await server.ssrLoadModule('/src/site/sections.ts')) as SectionsModule;
			return sections.loadTalks();
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
			expect(invalidatedRoutes('packages/content/src/blog/2026-06-22/index.md')).toEqual([
				'/blog/',
				'/feed.xml',
				'/blog/2026-06-22/',
				'/blog/2026-06-22.md',
			]);
		});

		it('invalidates all rendered pages for Markdown pipeline changes', () => {
			expect(invalidatedRoutes('packages/content/src/markdown/render.ts')).toBe('*');
		});

		it('ignores client assets handled by Vite', () => {
			expect(invalidatedRoutes('static/ryoppippi.jpg')).toBeNull();
		});
	});
}

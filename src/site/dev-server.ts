import type { Plugin, ViteDevServer } from 'vite';
import type { TweetRenderer } from '@ryoppippi/content';
import { mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';

type GenerateSite = (options: {
	assets: string;
	outDir: string;
	renderTweet: TweetRenderer;
	root: string;
}) => Promise<void>;

const DEV_ASSETS = '<script type="module" src="/src/site/client.ts"></script>';

function contentType(file: string): string {
	const extension = path.extname(file);
	return (
		{
			'.avif': 'image/avif',
			'.gif': 'image/gif',
			'.html': 'text/html; charset=utf-8',
			'.jpeg': 'image/jpeg',
			'.jpg': 'image/jpeg',
			'.json': 'application/json; charset=utf-8',
			'.md': 'text/markdown; charset=utf-8',
			'.png': 'image/png',
			'.svg': 'image/svg+xml',
			'.xml': 'application/xml; charset=utf-8',
		}[extension] ?? 'text/plain; charset=utf-8'
	);
}

function candidates(pathname: string): string[] {
	const decoded = decodeURIComponent(pathname);
	if (decoded.includes('..')) {
		return [];
	}

	const relative = decoded.replace(/^\/+/, '');
	if (relative.length === 0) {
		return ['index.html'];
	}
	if (relative.endsWith('/')) {
		return [`${relative}index.html`];
	}
	if (path.extname(relative).length > 0) {
		return [relative];
	}
	return [relative, `${relative}/index.html`, `${relative}.html`];
}

function watchesSite(file: string, root: string): boolean {
	const relative = path.relative(root, file).replaceAll('\\', '/');
	return (
		relative === 'routes.ts' ||
		relative === 'scripts/generate-site.ts' ||
		relative.startsWith('src/contents/') ||
		relative.startsWith('packages/content/src/') ||
		relative.startsWith('src/site/templates/') ||
		/^src\/site\/(content|generate|html|pages|secondary-pages|sections)\.ts$/.test(relative)
	);
}

async function findFile(outDir: string, pathname: string): Promise<string | null> {
	for (const candidate of candidates(pathname)) {
		const file = path.join(outDir, candidate);
		try {
			await readFile(file);
			return file;
		} catch {}
	}
	return null;
}

export function staticSiteDevServer(): Plugin {
	let pending = Promise.resolve();
	let timer: ReturnType<typeof setTimeout> | undefined;

	return {
		name: 'ryoppippi-static-site-dev-server',
		apply: (_config, { command, mode }) => command === 'serve' && mode !== 'test',
		configureServer(server: ViteDevServer) {
			const root = server.config.root;
			const outDir = path.join(root, 'node_modules/.vite/ryoppippi-site');
			const generate = async () => {
				const renderTweet = (
					(await server.ssrLoadModule('/packages/content/src/tweet-renderer.ts')) as {
						renderTweet: TweetRenderer;
					}
				).renderTweet;
				const generateSite = (
					(await server.ssrLoadModule('/src/site/generate.ts')) as { generateSite: GenerateSite }
				).generateSite;
				await rm(outDir, { recursive: true, force: true });
				await mkdir(outDir, { recursive: true });
				await generateSite({ assets: DEV_ASSETS, outDir, renderTweet, root });
			};

			pending = new Promise<void>((resolve, reject) => {
				const initialise = () => void generate().then(resolve, reject);
				if (server.httpServer == null) {
					setTimeout(initialise, 0);
				} else {
					server.httpServer.once('listening', initialise);
				}
			});
			server.watcher.on('all', (_event, file) => {
				if (!watchesSite(file, root)) {
					return;
				}
				clearTimeout(timer);
				timer = setTimeout(() => {
					pending = pending.then(generate).then(() => server.ws.send({ type: 'full-reload' }));
				}, 80);
			});

			server.middlewares.use(async (request, response, next) => {
				if (request.method !== 'GET' || request.url == null) {
					next();
					return;
				}

				await pending;
				const url = new URL(request.url, 'http://localhost');
				const file = await findFile(outDir, url.pathname);
				if (file == null) {
					if (request.headers.accept?.includes('text/html') === true) {
						const notFound = await readFile(path.join(outDir, '404.html'), 'utf8');
						response.statusCode = 404;
						response.setHeader('Content-Type', 'text/html; charset=utf-8');
						response.end(await server.transformIndexHtml(url.pathname, notFound));
						return;
					}
					next();
					return;
				}

				response.statusCode = 200;
				response.setHeader('Content-Type', contentType(file));
				if (file.endsWith('.html')) {
					const html = await readFile(file, 'utf8');
					response.end(await server.transformIndexHtml(url.pathname, html));
					return;
				}
				response.end(await readFile(file));
			});
		},
	};
}

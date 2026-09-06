import type {
	DevFileRoute,
	DevFileRouteModule,
	DevRouteCatalogue,
	DevRouteResponse,
} from './route-types.ts';
import type { SiteAssets } from '@/rendering/site-assets.ts';
import { createErrorPageFile } from '@/pages/error';
import { createDevRouteResponse, HTML_CONTENT_TYPE } from './route-types.ts';

const ROUTE_ROOT = '/src/routes/';
const routeModules = import.meta.glob('/src/routes/**/{route.ts,*.route.ts}', {
	eager: true,
}) as Record<string, DevFileRouteModule>;

function routePattern(moduleId: string): string {
	if (!moduleId.startsWith(ROUTE_ROOT)) {
		throw new Error(`Route module must be inside ${ROUTE_ROOT}: ${moduleId}`);
	}
	const relative = moduleId.slice(ROUTE_ROOT.length);
	if (relative === 'route.ts') {
		return '/';
	}
	if (relative.endsWith('/route.ts')) {
		return `/${relative.slice(0, -'route.ts'.length)}`;
	}
	if (relative.endsWith('.route.ts')) {
		return `/${relative.slice(0, -'.route.ts'.length)}`;
	}
	throw new Error(`Unsupported route filename: ${moduleId}`);
}

function expandRoutePattern(pattern: string, params: Readonly<Record<string, string>>): string {
	const used = new Set<string>();
	const path = pattern.replaceAll(/\[([^\]]+)\]/g, (_, name: string) => {
		const value = params[name];
		if (value == null) {
			throw new Error(`Missing route parameter "${name}" for ${pattern}`);
		}
		used.add(name);
		return encodeURIComponent(value);
	});
	const unused = Object.keys(params).filter((name) => !used.has(name));
	if (unused.length > 0) {
		throw new Error(`Unused route parameters for ${pattern}: ${unused.join(', ')}`);
	}
	return path;
}

/**
 * Discovers file-based routes and expands dynamic entries to exact host paths.
 *
 * Directory `route.ts` files produce trailing-slash URLs, while `*.route.ts`
 * files produce extension or slashless URLs. Bracketed names are populated by
 * the module's `entries()` export.
 *
 * @param catalogue - Content needed to enumerate dynamic routes.
 * @param modules - Route modules, injectable for focused tests.
 * @returns Exact paths and the module/parameter pair that renders each path.
 */
export function createDevFileRoutes(
	catalogue: DevRouteCatalogue,
	modules: Readonly<Record<string, DevFileRouteModule>> = routeModules,
): DevFileRoute[] {
	const routes: DevFileRoute[] = [];
	const paths = new Set<string>();

	for (const [moduleId, module] of Object.entries(modules).sort(([left], [right]) =>
		left.localeCompare(right),
	)) {
		const pattern = routePattern(moduleId);
		const entries = module.entries?.(catalogue) ?? [{}];
		for (const params of entries) {
			const path = expandRoutePattern(pattern, params);
			if (paths.has(path)) {
				throw new Error(`Duplicate development route: ${path}`);
			}
			paths.add(path);
			routes.push({ moduleId, params, path });
		}
	}

	return routes;
}

/**
 * Renders the development 404 page.
 *
 * @param assets - Site assets used by the error page.
 * @returns An HTML response with a 404 status.
 */
export function renderDevNotFound(assets: SiteAssets): DevRouteResponse {
	return createDevRouteResponse(createErrorPageFile(assets).content, HTML_CONTENT_TYPE, 404);
}

if (import.meta.vitest != null) {
	const render: DevFileRouteModule['render'] = async () => createDevRouteResponse('ok');
	const catalogue = { posts: [], dotfiles: '' } satisfies DevRouteCatalogue;

	it('derives static, slashless, and expanded paths from route filenames', () => {
		const routes = createDevFileRoutes(catalogue, {
			'/src/routes/route.ts': { render },
			'/src/routes/about/route.ts': { render },
			'/src/routes/blog/[slug]/route.ts': {
				entries: () => [{ slug: 'hello world' }],
				render,
			},
			'/src/routes/feed.xml.route.ts': { render },
		});

		expect(routes.map(({ path }) => path)).toEqual([
			'/about/',
			'/blog/hello%20world/',
			'/feed.xml',
			'/',
		]);
	});

	it('rejects route collisions', () => {
		expect(() =>
			createDevFileRoutes(catalogue, {
				'/src/routes/[page]/route.ts': { entries: () => [{ page: 'about' }], render },
				'/src/routes/about/route.ts': { render },
			}),
		).toThrow('Duplicate development route: /about/');
	});

	it('discovers the site route tree, including content-backed entries', () => {
		const routes = createDevFileRoutes({
			posts: [
				{
					title: 'File route',
					filename: 'file-route',
					filepath: '/content/file-route.md',
					pubDate: '2026-09-06T00:00:00.000Z',
					lang: 'en',
					isPublished: true,
					readingTime: 1,
				},
			],
			dotfiles: [
				'# Dotfiles',
				'## Setup',
				'### macOS',
				'1. Install',
				'```sh',
				'install-mac',
				'```',
				'### Linux',
				'2. Install',
				'```sh',
				'install-linux',
				'```',
			].join('\n'),
		});
		const paths = routes.map(({ path }) => path);

		expect(paths).toHaveLength(19);
		expect(paths).toEqual(
			expect.arrayContaining([
				'/',
				'/blog/file-route/',
				'/blog/file-route.md',
				'/dotfiles/mac/1',
				'/dotfiles/linux/2',
				'/works/media/feed.xml',
			]),
		);
	});
}

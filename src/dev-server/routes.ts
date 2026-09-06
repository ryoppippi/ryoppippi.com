import type {
	DevRoute,
	DevRouteCatalogue,
	DevRouteRenderer,
	DevRouteResponse,
} from './route-types.ts';
import type { SiteAssets } from '@/rendering/site-assets.ts';
import { extractInstallSection, extractSection, parseStepCommands } from '@/lib/dotfiles.ts';
import { postListItems } from '@/content/external-content.ts';
import { renderBlogFeed, renderMediaFeed } from '@/generation/feeds.ts';
import { createAboutPageFile } from '@/pages/about';
import { createArticlePageFiles } from '@/pages/blog/article';
import { createBlogListPageFile } from '@/pages/blog';
import { createErrorPageFile } from '@/pages/error';
import { createHomePageFile } from '@/pages/home';
import { createSponsorsPageFile } from '@/pages/sponsors';
import { createMediaPageFile } from '@/pages/works/media';
import { createOssPageFile } from '@/pages/works/oss';
import { createPublicationsPageFile } from '@/pages/works/publications';
import { createShowcasePageFile } from '@/pages/works/showcase';
import { createTalksPageFile } from '@/pages/works/talks';
import {
	createDevRouteResponse,
	HTML_CONTENT_TYPE,
	MARKDOWN_CONTENT_TYPE,
	TEXT_CONTENT_TYPE,
} from './route-types.ts';

const FIXED_ROUTES = [
	{
		path: '/',
		render: (async ({ assets }) =>
			createDevRouteResponse(createHomePageFile(assets).content)) satisfies DevRouteRenderer,
	},
	{
		path: '/about/',
		render: (async ({ assets }) =>
			createDevRouteResponse(createAboutPageFile(assets).content)) satisfies DevRouteRenderer,
	},
	{
		path: '/blog/',
		render: (async (dependencies) => {
			const [posts, externalPosts] = await Promise.all([
				dependencies.loadBlogPostMetadata(),
				dependencies.loadExternalPosts(),
			]);
			return createDevRouteResponse(
				createBlogListPageFile(
					[...externalPosts, ...postListItems(posts, { includeDrafts: true })],
					dependencies.assets,
				).content,
			);
		}) satisfies DevRouteRenderer,
	},
	{
		path: '/feed.xml',
		render: (async ({ loadBlogPostMetadata }) => {
			const feed = await renderBlogFeed(await loadBlogPostMetadata());
			return createDevRouteResponse(feed.content, feed.contentType);
		}) satisfies DevRouteRenderer,
	},
	{
		path: '/works/oss/',
		render: (async ({ assets, loadOssProjects }) =>
			createDevRouteResponse(
				createOssPageFile(await loadOssProjects(), assets).content,
			)) satisfies DevRouteRenderer,
	},
	{
		path: '/works/showcase/',
		render: (async ({ assets, loadShowcase }) =>
			createDevRouteResponse(
				createShowcasePageFile(await loadShowcase(), assets).content,
			)) satisfies DevRouteRenderer,
	},
	{
		path: '/works/publications/',
		render: (async ({ assets, loadPublications }) =>
			createDevRouteResponse(
				createPublicationsPageFile(await loadPublications(), assets).content,
			)) satisfies DevRouteRenderer,
	},
	{
		path: '/works/talks/',
		render: (async ({ assets, loadTalks }) =>
			createDevRouteResponse(
				createTalksPageFile(await loadTalks(), assets).content,
			)) satisfies DevRouteRenderer,
	},
	{
		path: '/works/media/',
		render: (async ({ assets, loadExternalMedia }) =>
			createDevRouteResponse(
				createMediaPageFile(await loadExternalMedia(), assets).content,
			)) satisfies DevRouteRenderer,
	},
	{
		path: '/works/media/feed.xml',
		render: (async ({ loadExternalMedia }) => {
			const feed = await renderMediaFeed(await loadExternalMedia());
			return createDevRouteResponse(feed.content, feed.contentType);
		}) satisfies DevRouteRenderer,
	},
	{
		path: '/sponsors/',
		render: (async ({ assets }) =>
			createDevRouteResponse(createSponsorsPageFile(assets).content)) satisfies DevRouteRenderer,
	},
] as const satisfies readonly DevRoute[];

function blogRoutes(posts: DevRouteCatalogue['posts']): DevRoute[] {
	return posts.flatMap(({ filename }) => {
		const slug = encodeURIComponent(filename);
		return [
			{
				path: `/blog/${slug}/`,
				render: (async ({ assets, loadBlogPost }) => {
					const post = await loadBlogPost(filename);
					return post == null
						? null
						: createDevRouteResponse(createArticlePageFiles(post, assets)[0].content);
				}) satisfies DevRouteRenderer,
			},
			{
				path: `/blog/${slug}.md`,
				render: (async ({ loadBlogPostSource }) => {
					const source = await loadBlogPostSource(filename);
					return source == null ? null : createDevRouteResponse(source, MARKDOWN_CONTENT_TYPE);
				}) satisfies DevRouteRenderer,
			},
		];
	});
}

function dotfilesRoutes(dotfiles: string): DevRoute[] {
	const routes: DevRoute[] = [
		{
			path: '/dotfiles.md',
			render: (async () =>
				createDevRouteResponse(dotfiles, MARKDOWN_CONTENT_TYPE)) satisfies DevRouteRenderer,
		},
		{
			path: '/dotfiles/install',
			render: (async () =>
				createDevRouteResponse(
					extractSection(dotfiles, 'Setup'),
					TEXT_CONTENT_TYPE,
				)) satisfies DevRouteRenderer,
		},
	];

	for (const [os, heading] of [
		['mac', 'macOS'],
		['linux', 'Linux'],
	] as const) {
		const section = extractInstallSection(dotfiles, heading);
		routes.push({
			path: `/dotfiles/${os}.html`,
			render: (async () => createDevRouteResponse(section)) satisfies DevRouteRenderer,
		});
		for (const { step, command } of parseStepCommands(section)) {
			routes.push({
				path: `/dotfiles/${os}/${step}`,
				render: (async () =>
					createDevRouteResponse(command, TEXT_CONTENT_TYPE)) satisfies DevRouteRenderer,
			});
		}
	}

	return routes;
}

/**
 * Builds exact development routes from the site's existing content catalogue.
 *
 * Blog and dotfiles routes follow their source data directly. Only fixed page
 * and feed endpoints remain declared here, avoiding a parallel route directory.
 *
 * @param catalogue - Content used to enumerate generated development URLs.
 * @returns Exact custom-host routes and their lazy renderers.
 */
export function createDevRoutes(catalogue: DevRouteCatalogue): DevRoute[] {
	const routes = [
		...FIXED_ROUTES,
		...blogRoutes(catalogue.posts),
		...dotfilesRoutes(catalogue.dotfiles),
	];
	const paths = new Set<string>();
	for (const route of routes) {
		if (paths.has(route.path)) {
			throw new Error(`Duplicate development route: ${route.path}`);
		}
		paths.add(route.path);
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
	const catalogue = {
		posts: [
			{
				title: 'Content route',
				filename: 'content route',
				filepath: '/content/content route.md',
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
	} satisfies DevRouteCatalogue;

	test('derives generated paths from the existing content catalogue', () => {
		const paths = createDevRoutes(catalogue).map(({ path }) => path);

		expect(paths).toHaveLength(19);
		expect(paths).toEqual(
			expect.arrayContaining([
				'/',
				'/blog/content%20route/',
				'/blog/content%20route.md',
				'/dotfiles/mac/1',
				'/dotfiles/linux/2',
				'/works/media/feed.xml',
			]),
		);
	});
}

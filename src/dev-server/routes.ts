import type { BlogPost, BlogPostMetadata, ShowcaseProject } from '@/content/index.ts';
import type { SiteAssets } from '@/rendering/site-assets.ts';
import type { PostListItem } from '@/contents/external-content.ts';
import type { OssProject, Talk } from '@/contents/works-data.ts';
import { extractInstallSection, extractSection, parseStepCommands } from '@/lib/dotfiles.ts';
import { postListItems } from '@/contents/external-content.ts';
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

type Publications = Record<
	string,
	Array<{ title: string; link: string; authors: string; publisher: string }>
>;

export type DevRouteDependencies = {
	assets: SiteAssets;
	loadBlogPost: (slug: string) => Promise<BlogPost | null>;
	loadBlogPostMetadata: () => Promise<BlogPostMetadata[]>;
	loadBlogPostSource: (slug: string) => Promise<string | null>;
	loadDotfiles: () => Promise<string>;
	loadExternalPosts: () => Promise<PostListItem[]>;
	loadExternalMedia: () => Promise<PostListItem[]>;
	loadOssProjects: () => Promise<OssProject[]>;
	loadPublications: () => Promise<Publications>;
	loadShowcase: () => Promise<ShowcaseProject[]>;
	loadTalks: () => Promise<Talk[]>;
};

export type DevRouteResponse = {
	body: string;
	contentType: string;
	status: number;
};

const htmlContentType = 'text/html; charset=utf-8';
const markdownContentType = 'text/markdown; charset=utf-8';
const textContentType = 'text/plain; charset=utf-8';

function createDevRouteResponse(
	body: string,
	contentType = htmlContentType,
	status = 200,
): DevRouteResponse {
	return { body, contentType, status };
}

async function renderBlogRoute(
	pathname: string,
	dependencies: DevRouteDependencies,
): Promise<DevRouteResponse | null> {
	if (pathname === '/blog/') {
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
	}

	const markdownMatch = /^\/blog\/([^/]+)\.md$/.exec(pathname);
	if (markdownMatch != null) {
		const source = await dependencies.loadBlogPostSource(markdownMatch[1]);
		return source == null ? null : createDevRouteResponse(source, markdownContentType);
	}

	const articleMatch = /^\/blog\/([^/]+)\/$/.exec(pathname);
	if (articleMatch == null) {
		return null;
	}
	const post = await dependencies.loadBlogPost(articleMatch[1]);
	if (post == null) {
		return createDevRouteResponse(
			createErrorPageFile(dependencies.assets).content,
			htmlContentType,
			404,
		);
	}
	return createDevRouteResponse(createArticlePageFiles(post, dependencies.assets)[0].content);
}

async function renderDotfilesRoute(
	pathname: string,
	dependencies: DevRouteDependencies,
): Promise<DevRouteResponse | null> {
	if (!pathname.startsWith('/dotfiles/')) {
		return null;
	}
	const readme = await dependencies.loadDotfiles();
	if (pathname === '/dotfiles/install') {
		return createDevRouteResponse(extractSection(readme, 'Setup'), textContentType);
	}

	const sectionMatch = /^\/dotfiles\/(mac|linux)\.html$/.exec(pathname);
	const stepMatch = /^\/dotfiles\/(mac|linux)\/(\d+)$/.exec(pathname);
	const match = sectionMatch ?? stepMatch;
	if (match == null) {
		return null;
	}
	const section = extractInstallSection(readme, match[1] === 'mac' ? 'macOS' : 'Linux');
	if (stepMatch == null) {
		return createDevRouteResponse(section, htmlContentType);
	}
	const step = Number(stepMatch[2]);
	const command = parseStepCommands(section).find((entry) => entry.step === step)?.command;
	return command == null ? null : createDevRouteResponse(command, textContentType);
}

export async function renderDevRoute(
	pathname: string,
	dependencies: DevRouteDependencies,
): Promise<DevRouteResponse | null> {
	if (pathname === '/') {
		return createDevRouteResponse(createHomePageFile(dependencies.assets).content);
	}
	if (pathname === '/about/') {
		return createDevRouteResponse(createAboutPageFile(dependencies.assets).content);
	}
	if (pathname.startsWith('/blog/')) {
		return renderBlogRoute(pathname, dependencies);
	}
	if (pathname === '/feed.xml') {
		const feed = await renderBlogFeed(await dependencies.loadBlogPostMetadata());
		return createDevRouteResponse(feed.content, feed.contentType);
	}
	if (pathname === '/works/oss/') {
		return createDevRouteResponse(
			createOssPageFile(await dependencies.loadOssProjects(), dependencies.assets).content,
		);
	}
	if (pathname === '/works/showcase/') {
		return createDevRouteResponse(
			createShowcasePageFile(await dependencies.loadShowcase(), dependencies.assets).content,
		);
	}
	if (pathname === '/works/publications/') {
		return createDevRouteResponse(
			createPublicationsPageFile(await dependencies.loadPublications(), dependencies.assets)
				.content,
		);
	}
	if (pathname === '/works/talks/') {
		return createDevRouteResponse(
			createTalksPageFile(await dependencies.loadTalks(), dependencies.assets).content,
		);
	}
	if (pathname === '/works/media/') {
		return createDevRouteResponse(
			createMediaPageFile(await dependencies.loadExternalMedia(), dependencies.assets).content,
		);
	}
	if (pathname === '/works/media/feed.xml') {
		const feed = await renderMediaFeed(await dependencies.loadExternalMedia());
		return createDevRouteResponse(feed.content, feed.contentType);
	}
	if (pathname === '/sponsors/') {
		return createDevRouteResponse(createSponsorsPageFile(dependencies.assets).content);
	}
	if (pathname === '/dotfiles.md') {
		return createDevRouteResponse(await dependencies.loadDotfiles(), markdownContentType);
	}
	return renderDotfilesRoute(pathname, dependencies);
}

export function renderDevNotFound(assets: SiteAssets): DevRouteResponse {
	return createDevRouteResponse(createErrorPageFile(assets).content, htmlContentType, 404);
}

if (import.meta.vitest != null) {
	const metadata = {
		title: 'Lazy article',
		filename: 'lazy-article',
		filepath: '/content/lazy-article.md',
		pubDate: '2026-06-22T00:00:00.000Z',
		lang: 'en',
		isPublished: true,
		readingTime: { text: '1 min read', minutes: 1, time: 60_000, words: 100 },
	} satisfies BlogPostMetadata;

	const post = {
		...metadata,
		source: '---\ntitle: Lazy article\n---\n\n# Lazy article',
		content: '# Lazy article',
		html: '<h1>Rendered only on demand</h1>',
	} satisfies BlogPost;

	function createTestDependencies() {
		return {
			assets: {
				base: '',
				client: '<script type="module" src="/src/client/index.ts"></script>',
				islands: {},
				oxContent: '',
				pageStyles: {
					about: '',
					article: '',
					blog: '',
					error: '',
					home: '',
					sponsors: '',
					works: '',
				},
			},
			loadBlogPost: vi.fn(async () => post),
			loadBlogPostMetadata: vi.fn(async (): Promise<BlogPostMetadata[]> => [metadata]),
			loadBlogPostSource: vi.fn(async () => post.source),
			loadDotfiles: vi.fn(async () => '# Dotfiles'),
			loadExternalPosts: vi.fn(async () => []),
			loadExternalMedia: vi.fn(async (): Promise<PostListItem[]> => []),
			loadOssProjects: vi.fn(async () => []),
			loadPublications: vi.fn(async () => ({})),
			loadShowcase: vi.fn(async () => []),
			loadTalks: vi.fn(async () => []),
		} satisfies DevRouteDependencies;
	}

	describe(renderDevRoute, () => {
		it('renders home without loading blog content', async () => {
			const loaders = createTestDependencies();

			const result = await renderDevRoute('/', loaders);

			expect(result).toMatchObject({ status: 200, contentType: htmlContentType });
			expect(loaders.loadBlogPost).not.toHaveBeenCalled();
			expect(loaders.loadBlogPostMetadata).not.toHaveBeenCalled();
		});

		it('renders the blog list from metadata without rendering an article', async () => {
			const loaders = createTestDependencies();

			await renderDevRoute('/blog/', loaders);

			expect(loaders.loadBlogPostMetadata).toHaveBeenCalledOnce();
			expect(loaders.loadBlogPost).not.toHaveBeenCalled();
		});

		it('renders only the requested article', async () => {
			const loaders = createTestDependencies();

			await renderDevRoute('/blog/lazy-article/', loaders);

			expect(loaders.loadBlogPost).toHaveBeenCalledWith('lazy-article');
			expect(loaders.loadBlogPostMetadata).not.toHaveBeenCalled();
		});

		it('serves raw Markdown without rendering the article', async () => {
			const loaders = createTestDependencies();

			const result = await renderDevRoute('/blog/lazy-article.md', loaders);

			expect(result).toMatchObject({ body: post.source, contentType: markdownContentType });
			expect(loaders.loadBlogPostSource).toHaveBeenCalledWith('lazy-article');
			expect(loaders.loadBlogPost).not.toHaveBeenCalled();
		});

		it('renders the media page from curated media', async () => {
			const loaders = createTestDependencies();

			await renderDevRoute('/works/media/', loaders);

			expect(loaders.loadExternalMedia).toHaveBeenCalledOnce();
		});

		it('renders the blog RSS route with Ox Content', async () => {
			const result = await renderDevRoute('/feed.xml', createTestDependencies());

			expect(result).toMatchObject({
				contentType: 'application/rss+xml; charset=utf-8',
				status: 200,
			});
		});

		it('renders the curated media RSS route with Ox Content', async () => {
			const loaders = createTestDependencies();
			loaders.loadExternalMedia.mockResolvedValue([
				{
					title: 'Interview',
					slug: 'interview',
					link: 'https://example.com/interview',
					pubDate: '2026-08-20T12:34:56.000Z',
					lang: 'ja',
					external: true,
					kind: 'podcast',
				},
			]);

			const result = await renderDevRoute('/works/media/feed.xml', loaders);

			expect(result).toMatchObject({
				contentType: 'application/rss+xml; charset=utf-8',
				status: 200,
			});
			expect(loaders.loadExternalMedia).toHaveBeenCalledOnce();
		});
	});

	it('renders the site error page with a 404 status', () => {
		expect(renderDevNotFound(createTestDependencies().assets)).toMatchObject({
			status: 404,
			contentType: htmlContentType,
		});
	});
}

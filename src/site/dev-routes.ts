import type { BlogPost, BlogPostMetadata, ShowcaseProject } from '@ryoppippi/content';
import type { SiteAssets } from './assets.ts';
import type { PostListItem } from './content.ts';
import type { OssProject, Talk } from './sections.ts';
import { extractInstallSection, extractSection, parseStepCommands } from '../lib/dotfiles.ts';
import { postListItems } from './content.ts';
import { articlePages, blogListPage, feed, homePage } from './pages.ts';
import {
	errorPage,
	ossPage,
	publicationsPage,
	showcasePage,
	sponsorsPage,
	talksPage,
} from './secondary-pages.ts';

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
	loadOssProjects: () => Promise<Record<string, OssProject[]>>;
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

function response(body: string, contentType = htmlContentType, status = 200): DevRouteResponse {
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
		return response(
			blogListPage([...externalPosts, ...postListItems(posts)], dependencies.assets).content,
		);
	}

	const markdownMatch = /^\/blog\/([^/]+)\.md$/.exec(pathname);
	if (markdownMatch != null) {
		const source = await dependencies.loadBlogPostSource(markdownMatch[1]);
		return source == null ? null : response(source, markdownContentType);
	}

	const articleMatch = /^\/blog\/([^/]+)\/$/.exec(pathname);
	if (articleMatch == null) {
		return null;
	}
	const post = await dependencies.loadBlogPost(articleMatch[1]);
	if (post == null) {
		return response(errorPage(dependencies.assets).content, htmlContentType, 404);
	}
	return response(articlePages(post, dependencies.assets)[0].content);
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
		return response(extractSection(readme, 'Initial Setup'), textContentType);
	}

	const sectionMatch = /^\/dotfiles\/(mac|linux)\.html$/.exec(pathname);
	const stepMatch = /^\/dotfiles\/(mac|linux)\/(\d+)$/.exec(pathname);
	const match = sectionMatch ?? stepMatch;
	if (match == null) {
		return null;
	}
	const section = extractInstallSection(readme, match[1] === 'mac' ? 'macOS' : 'Linux');
	if (stepMatch == null) {
		return response(section, htmlContentType);
	}
	const step = Number(stepMatch[2]);
	const command = parseStepCommands(section).find((entry) => entry.step === step)?.command;
	return command == null ? null : response(command, textContentType);
}

export async function renderDevRoute(
	pathname: string,
	dependencies: DevRouteDependencies,
): Promise<DevRouteResponse | null> {
	if (pathname === '/') {
		return response(homePage(dependencies.assets).content);
	}
	if (pathname.startsWith('/blog/')) {
		return renderBlogRoute(pathname, dependencies);
	}
	if (pathname === '/feed.xml') {
		return response(
			feed(await dependencies.loadBlogPostMetadata()).content,
			'application/xml; charset=utf-8',
		);
	}
	if (pathname === '/works/oss/') {
		return response(ossPage(await dependencies.loadOssProjects(), dependencies.assets).content);
	}
	if (pathname === '/works/showcase/') {
		return response(showcasePage(await dependencies.loadShowcase(), dependencies.assets).content);
	}
	if (pathname === '/works/publications/') {
		return response(
			publicationsPage(await dependencies.loadPublications(), dependencies.assets).content,
		);
	}
	if (pathname === '/works/talks/') {
		return response(talksPage(await dependencies.loadTalks(), dependencies.assets).content);
	}
	if (pathname === '/sponsors/') {
		return response(sponsorsPage(dependencies.assets).content);
	}
	if (pathname === '/dotfiles.md') {
		return response(await dependencies.loadDotfiles(), markdownContentType);
	}
	return renderDotfilesRoute(pathname, dependencies);
}

export function renderDevNotFound(assets: SiteAssets): DevRouteResponse {
	return response(errorPage(assets).content, htmlContentType, 404);
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

	function dependencies() {
		return {
			assets: {
				base: '',
				client: '<script type="module" src="/src/site/client.ts"></script>',
				pages: { article: '', blog: '', error: '', home: '', sponsors: '', works: '' },
				tweet: '',
			},
			loadBlogPost: vi.fn(async () => post),
			loadBlogPostMetadata: vi.fn(async () => [metadata]),
			loadBlogPostSource: vi.fn(async () => post.source),
			loadDotfiles: vi.fn(async () => '# Dotfiles'),
			loadExternalPosts: vi.fn(async () => []),
			loadOssProjects: vi.fn(async () => ({})),
			loadPublications: vi.fn(async () => ({})),
			loadShowcase: vi.fn(async () => []),
			loadTalks: vi.fn(async () => []),
		} satisfies DevRouteDependencies;
	}

	describe(renderDevRoute, () => {
		it('renders home without loading blog content', async () => {
			const loaders = dependencies();

			const result = await renderDevRoute('/', loaders);

			expect(result).toMatchObject({ status: 200, contentType: htmlContentType });
			expect(loaders.loadBlogPost).not.toHaveBeenCalled();
			expect(loaders.loadBlogPostMetadata).not.toHaveBeenCalled();
		});

		it('renders the blog list from metadata without rendering an article', async () => {
			const loaders = dependencies();

			const result = await renderDevRoute('/blog/', loaders);

			expect(result?.body).toContain('Lazy article');
			expect(loaders.loadBlogPostMetadata).toHaveBeenCalledOnce();
			expect(loaders.loadBlogPost).not.toHaveBeenCalled();
		});

		it('renders only the requested article', async () => {
			const loaders = dependencies();

			const result = await renderDevRoute('/blog/lazy-article/', loaders);

			expect(result?.body).toContain('Rendered only on demand');
			expect(loaders.loadBlogPost).toHaveBeenCalledWith('lazy-article');
			expect(loaders.loadBlogPostMetadata).not.toHaveBeenCalled();
		});

		it('serves raw Markdown without rendering the article', async () => {
			const loaders = dependencies();

			const result = await renderDevRoute('/blog/lazy-article.md', loaders);

			expect(result).toMatchObject({ body: post.source, contentType: markdownContentType });
			expect(loaders.loadBlogPostSource).toHaveBeenCalledWith('lazy-article');
			expect(loaders.loadBlogPost).not.toHaveBeenCalled();
		});
	});

	it('renders the site error page with a 404 status', () => {
		expect(renderDevNotFound(dependencies().assets)).toMatchObject({
			status: 404,
			contentType: htmlContentType,
		});
	});
}

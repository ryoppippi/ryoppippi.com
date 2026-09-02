import oxContent from '@ox-content/napi';
import { discoverDocumentMdxIslands } from '@ox-content/vite-plugin';
import { renderToString } from '@solidjs/web';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { matter } from 'gray-matter-es';
import readingTime from 'reading-time';
import Parser from 'rss-parser';
import { glob } from 'tinyglobby';
import type { ContentMarkdownRenderer } from './markdown.ts';
import type { GeneratedFile } from '../index.ts';
import type { SiteAssets } from '../../site/assets.ts';
import * as ufo from 'ufo';
import { formatDate } from '../../lib/util.ts';
import { islandModuleIds } from '../../site/assets.ts';
import { SITE_ORIGIN } from '../../site/consts.ts';
import { page, renderComponent } from '../../site/html.ts';
import { SITE_OWNER } from '../../site/site-owner.ts';
import Article from '../../site/templates/Article.tsx';
import BlogList from '../../site/templates/BlogList.tsx';

const BLOG_SOURCE_PATTERNS = ['*.md', '*.mdx', '*/index.md', '*/index.mdx'] as const;

export const blogDirectory = path.resolve(import.meta.dirname, '../../content/blog');

/**
 * SEO metadata that can be declared in an article's frontmatter.
 *
 * @example
 * ```yaml
 * description: A short summary for search results.
 * image: /images/article-cover.jpg
 * alternates:
 *   en: https://example.com/en/
 *   ja: https://example.com/ja/
 *   x-default: https://example.com/en/
 * ```
 */
export type ArticleMetadata = {
	description?: string;
	image?: string;
	alternates?: Readonly<Record<string, string>>;
};

/**
 * A rendered blog post and the metadata needed to publish it.
 */
export type BlogPost = ArticleMetadata & {
	title: string;
	filename: string;
	filepath: string;
	source: string;
	content: string;
	html: string;
	pubDate: string;
	lang: string;
	isPublished: boolean;
	readingTime: ReturnType<typeof readingTime>;
};

/**
 * The inexpensive metadata used by blog indexes and feeds.
 */
export type BlogPostMetadata = Pick<
	BlogPost,
	| 'title'
	| 'description'
	| 'image'
	| 'alternates'
	| 'filename'
	| 'filepath'
	| 'pubDate'
	| 'lang'
	| 'isPublished'
	| 'readingTime'
>;

/** A local or external entry rendered in a post list. */
export type PostListItem = {
	title: string;
	slug: string;
	link: string;
	pubDate: string;
	lang: string;
	external: boolean;
	kind?: 'article' | 'podcast' | 'video';
	playlist?: boolean;
	draft?: boolean;
};

type ExternalPostInput = {
	title?: string | null;
	link?: string | null;
	pubDate?: string | null;
	guid?: string | null;
	lang?: string | null;
	kind?: 'article' | 'podcast' | 'video' | null;
	playlist?: boolean | null;
};

function toExternalPost(item: ExternalPostInput): PostListItem | null {
	if (item.title == null || item.link == null || item.pubDate == null) {
		return null;
	}

	const pubDate = new Date(item.pubDate);
	if (Number.isNaN(pubDate.getTime())) {
		return null;
	}

	return {
		title: item.title,
		slug: item.guid ?? item.link,
		link: item.link,
		pubDate: pubDate.toJSON(),
		lang: item.lang ?? 'ja',
		external: true,
		kind: item.kind ?? 'article',
		...(item.playlist === true ? { playlist: true } : {}),
	};
}

/**
 * Loads external blog entries from RSS feeds and curated articles.
 *
 * @param root - Repository root containing the external content configuration.
 * @returns Blog-list entries for external content.
 */
export async function loadExternalPosts(root = process.cwd()): Promise<PostListItem[]> {
	const [rssSource, postsSource] = await Promise.all([
		readFile(path.join(root, 'src/content/external-rss/rss.json'), 'utf8'),
		readFile(path.join(root, 'src/content/external-rss/posts.json'), 'utf8'),
	]);
	const sources = JSON.parse(rssSource) as string[];
	const configuredPosts = JSON.parse(postsSource) as ExternalPostInput[];
	const parser = new Parser();
	const feeds = await Promise.allSettled(sources.map(async (source) => parser.parseURL(source)));
	const feedPosts = feeds.flatMap((result) => {
		if (result.status === 'rejected') {
			console.warn('Skipping external RSS feed: ' + String(result.reason));
			return [];
		}
		return result.value.items.flatMap((item) => {
			const post = toExternalPost(item);
			return post == null ? [] : [post];
		});
	});
	const manualPosts = configuredPosts.flatMap((item) => {
		const post = toExternalPost(item);
		return post == null ? [] : [post];
	});
	return [...feedPosts, ...manualPosts];
}

/**
 * Converts blog metadata into entries for the shared blog list.
 *
 * @param posts - Blog post metadata to list.
 * @param options - Whether unpublished posts should be included.
 * @returns List items for the blog index page.
 */
export function postListItems(
	posts: BlogPostMetadata[],
	options: { includeDrafts?: boolean } = {},
): PostListItem[] {
	return posts
		.filter((post) => (options.includeDrafts ?? false) || post.isPublished)
		.map((post) => ({
			title: post.title,
			slug: post.filename,
			link: '/blog/' + post.filename + '/',
			pubDate: post.pubDate,
			lang: post.lang,
			external: false,
			draft: !post.isPublished,
		}));
}

function parseAlternates(value: unknown): Readonly<Record<string, string>> | undefined {
	if (typeof value !== 'object' || value == null || Array.isArray(value)) {
		return undefined;
	}
	const entries: Array<[string, string]> = [];
	for (const [language, url] of Object.entries(value)) {
		if (typeof url !== 'string') {
			continue;
		}
		const trimmedUrl = url.trim();
		if (trimmedUrl.length > 0) {
			entries.push([language, trimmedUrl]);
		}
	}
	return entries.length === 0 ? undefined : Object.fromEntries(entries);
}

function parseArticleMetadata(data: Record<string, unknown>): ArticleMetadata {
	const description =
		typeof data.description === 'string' && data.description.trim().length > 0
			? data.description.trim()
			: undefined;
	const image =
		typeof data.image === 'string' && data.image.trim().length > 0 ? data.image.trim() : undefined;
	return { description, image, alternates: parseAlternates(data.alternates) };
}

function filenameFor(filepath: string): string {
	return /^index\.mdx?$/.test(path.basename(filepath))
		? path.basename(path.dirname(filepath))
		: path.basename(filepath, path.extname(filepath));
}

type BlogPostIslands = Record<string, string>;

async function resolveBlogPostIslands(
	content: string,
	filepath: string,
	directory: string,
): Promise<BlogPostIslands> {
	const parsed = oxContent.transform(content, { frontmatter: false, mdx: true });
	const discovered = await discoverDocumentMdxIslands({
		source: content,
		components: {},
		imports: parsed.imports,
		documentPath: filepath,
		contentRoot: directory,
	});
	const used = new Set(discovered.usedComponents);
	return Object.fromEntries(
		[...discovered.localBindings.values()]
			.filter(
				(binding) =>
					used.has(binding.localName) &&
					binding.kind === 'default' &&
					binding.resolvedPath.endsWith('.tsx'),
			)
			.map((binding) => [
				binding.localName,
				path.relative(directory, binding.resolvedPath).replaceAll(path.sep, '/'),
			]),
	);
}

async function loadRenderOptions(content: string, filepath: string, directory: string) {
	if (path.extname(filepath).toLowerCase() !== '.mdx') {
		return undefined;
	}
	const islands = await resolveBlogPostIslands(content, filepath, directory);
	const hasIslands = Object.keys(islands).length > 0;
	return hasIslands ? { islands, mdx: true } : { mdx: true };
}

async function findBlogPostSource(slug: string, directory: string) {
	if (slug.length === 0 || path.basename(slug) !== slug) {
		return null;
	}

	for (const filepath of [
		path.join(directory, `${slug}.md`),
		path.join(directory, `${slug}.mdx`),
		path.join(directory, slug, 'index.md'),
		path.join(directory, slug, 'index.mdx'),
	]) {
		try {
			return { filepath, source: await readFile(filepath, 'utf8') };
		} catch (error) {
			if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
				throw error;
			}
		}
	}

	return null;
}

export async function loadBlogPostSource(
	slug: string,
	directory = blogDirectory,
): Promise<string | null> {
	return (await findBlogPostSource(slug, directory))?.source ?? null;
}

/**
 * Loads and renders one article by its safe URL slug.
 *
 * @param slug - Article filename or directory slug.
 * @param renderContent - Optional Markdown renderer used by tests and callers.
 * @param directory - Blog source directory.
 * @returns The rendered article, or `null` when the slug does not exist.
 */
export async function loadBlogPost(
	slug: string,
	renderContent?: ContentMarkdownRenderer,
	directory = blogDirectory,
): Promise<BlogPost | null> {
	const entry = await findBlogPostSource(slug, directory);
	if (entry == null) {
		return null;
	}

	const render = renderContent ?? (await import('./markdown.ts')).renderContentMarkdown;
	const { data, content } = matter(entry.source);
	const renderOptions = await loadRenderOptions(content, entry.filepath, directory);
	return {
		...parseArticleMetadata(data),
		title: String(data.title),
		filename: filenameFor(entry.filepath),
		filepath: entry.filepath,
		source: entry.source,
		content,
		html: renderOptions == null ? await render(content) : await render(content, renderOptions),
		pubDate: new Date(String(data.date)).toJSON(),
		lang: typeof data.lang === 'string' ? data.lang : 'ja',
		isPublished: data.isPublished === true,
		readingTime: readingTime(content),
	} satisfies BlogPost;
}

/**
 * Loads article frontmatter without rendering article HTML.
 *
 * @param directory - Blog source directory.
 * @returns Metadata sorted from newest publication date to oldest.
 */
export async function loadBlogPostMetadata(directory = blogDirectory): Promise<BlogPostMetadata[]> {
	const files = await glob(BLOG_SOURCE_PATTERNS, { cwd: directory, absolute: true });
	const posts = await Promise.all(
		files.map(async (filepath) => {
			const source = await readFile(filepath, 'utf8');
			const { data, content } = matter(source);
			return {
				...parseArticleMetadata(data),
				title: String(data.title),
				filename: filenameFor(filepath),
				filepath,
				pubDate: new Date(String(data.date)).toJSON(),
				lang: typeof data.lang === 'string' ? data.lang : 'ja',
				isPublished: data.isPublished === true,
				readingTime: readingTime(content),
			} satisfies BlogPostMetadata;
		}),
	);

	return posts.sort((a, b) => b.pubDate.localeCompare(a.pubDate));
}

/**
 * Loads and renders every article in the configured blog directory.
 *
 * @param renderContent - Optional Markdown renderer used by tests and callers.
 * @returns Rendered articles sorted from newest publication date to oldest.
 */
export async function loadBlogPosts(renderContent?: ContentMarkdownRenderer): Promise<BlogPost[]> {
	const render = renderContent ?? (await import('./markdown.ts')).renderContentMarkdown;
	const blogDir = blogDirectory;
	const files = await glob(BLOG_SOURCE_PATTERNS, { cwd: blogDir, absolute: true });
	const posts = await Promise.all(
		files.map(async (filepath) => {
			const source = await readFile(filepath, 'utf8');
			const { data, content } = matter(source);
			const filename = filenameFor(filepath);
			const renderOptions = await loadRenderOptions(content, filepath, blogDir);
			return {
				...parseArticleMetadata(data),
				title: String(data.title),
				filename,
				filepath,
				source,
				content,
				html: renderOptions == null ? await render(content) : await render(content, renderOptions),
				pubDate: new Date(String(data.date)).toJSON(),
				lang: typeof data.lang === 'string' ? data.lang : 'ja',
				isPublished: data.isPublished === true,
				readingTime: readingTime(content),
			} satisfies BlogPost;
		}),
	);

	return posts.sort((a, b) => b.pubDate.localeCompare(a.pubDate));
}

type BlogIslandModule = { default: (props: Record<string, unknown>) => unknown };

/**
 * Loads a blog-colocated Solid component through the host's module loader.
 *
 * @param path - Source-root-relative module path.
 * @returns The loaded module.
 */
export type BlogIslandModuleLoader = (path: string) => Promise<unknown>;

/** Server renderer for a Solid component colocated with a blog post. */
export type BlogIslandSsrRenderer = (
	moduleId: string,
	props: Record<string, unknown>,
) => Promise<string | null>;

/**
 * Creates the small host adapter needed to SSR blog-local Solid components.
 *
 * Ox Content owns island discovery, payload handling, hydration, and cleanup;
 * this adapter only loads the component and renders its initial HTML.
 *
 * @param load - Vite SSR loader for paths relative to the site source root.
 * @returns A renderer that returns component HTML, or null when loading fails.
 */
export function createBlogIslandSsrRenderer(load: BlogIslandModuleLoader): BlogIslandSsrRenderer {
	const cache = new Map<string, Promise<string | null>>();

	return async (moduleId, props) => {
		const key = moduleId + ' ' + JSON.stringify(props);
		const cached = cache.get(key);
		if (cached != null) {
			return cached;
		}

		const pending = (async () => {
			try {
				const module = (await load('/src/content/blog/' + moduleId)) as BlogIslandModule;
				if (typeof module?.default !== 'function') {
					return null;
				}
				return renderToString(() => module.default(props));
			} catch (error) {
				console.warn('[blog island ssr] failed to render ' + moduleId + ':', error);
				return null;
			}
		})();

		cache.set(key, pending);
		return pending;
	};
}

type ArticleSeoMetadata = ArticleMetadata & { description: string };

function markdownDescription(content: string): string | undefined {
	const paragraph = content
		.split(/\n\s*\n/)
		.map((block) => block.trim())
		.find((block) => block.length > 0 && !/^(?:#|>|import\s)/.test(block));
	if (paragraph == null) {
		return undefined;
	}

	const text = paragraph
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/<[^>]*>/g, ' ')
		.replace(/[\\`*_~>#]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	return text.length > 0 ? text.slice(0, 160) : undefined;
}

function articleSeoMetadata(post: BlogPost): ArticleSeoMetadata {
	return {
		description: post.description?.trim() || markdownDescription(post.content) || post.title,
		image: post.image,
		alternates: post.alternates,
	};
}

function articleImageUrl(html: string, articleUrl: string): string | undefined {
	const source = html.match(/<img src="([^"]+)"/)?.[1];
	return source == null
		? undefined
		: new URL(
				source.replaceAll('&amp;', '&').replaceAll('&#x26;', '&').replaceAll('&#38;', '&'),
				articleUrl,
			).href;
}

function articleStructuredData(
	post: BlogPost,
	description: string,
	url: string,
	image: string | undefined,
) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.title,
		description,
		url,
		mainEntityOfPage: { '@type': 'WebPage', '@id': url },
		author: {
			'@type': 'Person',
			'@id': SITE_OWNER.id,
			name: SITE_OWNER.name,
			alternateName: [SITE_OWNER.japaneseName, SITE_OWNER.handle],
			url: SITE_OWNER.url,
		},
		datePublished: post.pubDate,
		...(image == null ? {} : { image }),
		inLanguage: post.lang,
	};
}

/**
 * Renders the blog index page.
 *
 * @param items - Local and external posts to list.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated blog index page.
 */
export function blogListPage(items: PostListItem[], assets: SiteAssets): GeneratedFile {
	const sorted = items.toSorted((a, b) => b.pubDate.localeCompare(a.pubDate));
	return {
		path: 'blog/index.html',
		sourcePaths: [
			'src/pages/blog/index.ts',
			'src/site/templates/BlogList.tsx',
			'src/content/blog',
			'src/content/external-rss/rss.json',
			'src/content/external-rss/posts.json',
		],
		content: page({
			title: 'Blog',
			pathname: '/blog/',
			content: renderComponent(BlogList, { items: sorted }),
			description:
				'Technical articles by @ryoppippi about software engineering, developer tooling, open source, and AI.',
			assets,
			style: 'blog',
		}),
	};
}

/**
 * Renders the HTML and Markdown-source files for one article.
 *
 * @param post - Rendered article and its frontmatter metadata.
 * @param assets - Site assets used by the article template.
 * @returns The published HTML page and its source companion file.
 */
export function articlePages(post: BlogPost, assets: SiteAssets): GeneratedFile[] {
	const pathname = `/blog/${post.filename}/`;
	const url = ufo.joinURL(SITE_ORIGIN, pathname);
	const metadata = articleSeoMetadata(post);
	const image =
		metadata.image == null ? articleImageUrl(post.html, url) : new URL(metadata.image, url).href;
	const content = renderComponent(Article, {
		date: formatDate(new Date(post.pubDate)),
		pathname,
		post,
	});
	const sourcePath = /^index\.mdx?$/.test(path.basename(post.filepath))
		? path.dirname(post.filepath)
		: post.filepath;
	return [
		{
			path: `blog/${post.filename}/index.html`,
			sourcePaths: ['src/site/site-owner.ts', sourcePath],
			content: page({
				title: `${post.title} | blog`,
				pathname,
				content,
				description: metadata.description,
				datePublished: post.pubDate,
				lang: post.lang,
				alternates: metadata.alternates,
				assets,
				article: true,
				islands: islandModuleIds(post.html),
				style: 'article',
				structuredData: articleStructuredData(post, metadata.description, url, image),
			}),
		},
		{ path: `blog/${post.filename}.md`, content: post.source },
	];
}

if (import.meta.vitest != null) {
	describe('blog loaders', () => {
		it('keeps one central Tweet snapshot for every embedded post', async () => {
			const directory = blogDirectory;
			const cacheDirectory = path.resolve(
				import.meta.dirname,
				'../../..',
				'.cache/ox-content/twitter',
			);
			const [files, cacheFiles] = await Promise.all([
				glob(BLOG_SOURCE_PATTERNS, { cwd: directory, absolute: true }),
				glob('*-en.json', { cwd: cacheDirectory }),
			]);
			const referencedIds = new Set<string>();
			for (const file of files) {
				const source = await readFile(file, 'utf8');
				for (const match of source.matchAll(/<Tweet\b[^>]*\bid="([0-9]+)"/g)) {
					referencedIds.add(match[1]);
				}
			}

			expect([...referencedIds].sort()).toEqual(
				cacheFiles.map((file) => file.replace(/-en\.json$/, '')).sort(),
			);
		});

		it('returns null for an unknown blog slug', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'secret.md': '---\ntitle: Secret\ndate: 2026-06-22\nisPublished: true\n---\nSecret',
				content: {},
			});
			const renderContent = vi.fn(async (content: string) => content);

			await expect(
				loadBlogPost('../secret', renderContent, fixture.getPath('content')),
			).resolves.toBeNull();
			expect(renderContent).not.toHaveBeenCalled();
		});

		it('renders only the requested blog post', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'first/index.md': '---\ntitle: First\ndate: 2026-06-21\nisPublished: true\n---\nFirst body',
				'second/index.md':
					'---\ntitle: Second\ndate: 2026-06-22\nisPublished: true\n---\nSecond body',
			});
			const renderContent = vi.fn(async (content: string) => `<p>${content}</p>`);

			const post = await loadBlogPost('second', renderContent, fixture.getPath());

			expect(renderContent).toHaveBeenCalledOnce();
			expect(renderContent).toHaveBeenCalledWith('Second body');
			expect(post).toEqual(expect.objectContaining({ filename: 'second', title: 'Second' }));
		});

		it('loads an MDX post with its document-local islands enabled', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'component/index.mdx': [
					'---',
					'title: Component post',
					'date: 2026-06-23',
					'isPublished: true',
					'---',
					'',
					"import Chart from './Chart.tsx'",
					'',
					'<Chart />',
				].join('\n'),
				'component/Chart.tsx': 'export default () => null',
			});
			const renderContent = vi.fn(async (content: string) => content);

			const post = await loadBlogPost('component', renderContent, fixture.getPath());

			expect(post).toEqual(
				expect.objectContaining({ filename: 'component', title: 'Component post' }),
			);
			expect(renderContent).toHaveBeenCalledWith(
				expect.stringContaining("import Chart from './Chart.tsx'\n\n<Chart />"),
				{
					mdx: true,
					islands: { Chart: 'component/Chart.tsx' },
				},
			);
		});

		it('loads raw source without rendering Markdown', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'first.md': '---\ntitle: First\ndate: 2025-01-01\n---\n\nFirst body',
			});

			expect(await loadBlogPostSource('first', fixture.getPath())).toContain('First body');
		});

		it('loads list metadata without rendered article HTML', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'2026-06-22/index.md': [
					'---',
					'title: Lazy content',
					'date: 2026-06-22',
					'isPublished: true',
					"lang: 'en'",
					'---',
					'',
					'Hello world',
				].join('\n'),
			});

			const posts = await loadBlogPostMetadata(fixture.getPath());

			expect(posts).toEqual([
				expect.objectContaining({
					filename: '2026-06-22',
					isPublished: true,
					lang: 'en',
					title: 'Lazy content',
				}),
			]);
			expect(posts[0]).not.toHaveProperty('html');
		});

		it('parses reusable SEO metadata from article frontmatter', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'article/index.md': [
					'---',
					'title: Article',
					'date: 2026-06-22',
					'isPublished: true',
					'lang: en',
					'description: A useful article summary.',
					'image: /images/article-cover.jpg',
					'alternates:',
					'  en: " https://example.com/en/ "',
					'  ja: https://example.com/ja/',
					'  x-default: https://example.com/en/',
					'  empty: "  "',
					'---',
					'',
					'Article body',
				].join('\n'),
			});
			const renderContent = vi.fn(async (content: string) => content);

			await expect(loadBlogPost('article', renderContent, fixture.getPath())).resolves.toEqual(
				expect.objectContaining({
					description: 'A useful article summary.',
					image: '/images/article-cover.jpg',
					alternates: {
						en: 'https://example.com/en/',
						ja: 'https://example.com/ja/',
						'x-default': 'https://example.com/en/',
					},
				}),
			);
		});

		it('loads and renders a blog-local Solid island through the host loader', async () => {
			const { ssr } = await import('@solidjs/web');
			const load = vi.fn(async (_modulePath: string) => ({
				default: () => ssr('<p>solid</p>'),
			}));
			const renderIsland = createBlogIslandSsrRenderer(load);

			expect(await renderIsland('post/Chart.tsx', {})).toBe('<p>solid</p>');
			expect(load).toHaveBeenCalledWith('/src/content/blog/post/Chart.tsx');
		});

		it('returns null when a blog island cannot be loaded', async () => {
			const renderIsland = createBlogIslandSsrRenderer(() => Promise.reject(new Error('missing')));

			expect(await renderIsland('post/Chart.tsx', {})).toBeNull();
		});
	});

	describe('blog pages', () => {
		const assets = {
			base: '',
			client: '',
			islands: {},
			oxContent: '',
			pages: { about: '', article: '', blog: '', error: '', home: '', sponsors: '', works: '' },
		} as const satisfies SiteAssets;
		const examplePost = {
			title: 'Example article',
			description: 'A concise description for an example article.',
			alternates: {
				ja: 'https://example.com/ja/',
				en: 'https://ryoppippi.com/blog/example-article/',
				'x-default': 'https://example.com/en/',
			},
			filename: 'example-article',
			filepath: '/content/example-article/index.md',
			source: '---\ntitle: Example\n---\nBody',
			content: 'A concise article summary.',
			html: '<p>A concise article summary.</p>',
			pubDate: '2026-01-01T00:00:00.000Z',
			image: '/assets/content/article-cover.avif',
			lang: 'en',
			isPublished: true,
			readingTime: { text: '1 min read', minutes: 1, time: 60_000, words: 100 },
		} satisfies BlogPost;

		test('tracks the whole source directory for an index MDX article', () => {
			const [article] = articlePages(
				{ ...examplePost, filepath: '/content/example-article/index.mdx' },
				assets,
			);

			expect(article.sourcePaths).toContain('/content/example-article');
			expect(article.sourcePaths).not.toContain('/content/example-article/index.mdx');
		});

		test('derives an article description from the first prose paragraph', () => {
			expect(
				markdownDescription(
					'# Heading\n\nA useful fallback paragraph with [a link](https://example.com).',
				),
			).toBe('A useful fallback paragraph with a link.');
		});

		test('resolves the first rendered article image against the article URL', () => {
			expect(
				articleImageUrl(
					'<p><img src="./first-image.png" alt="Example"></p>',
					'https://ryoppippi.com/blog/example-article/',
				),
			).toBe('https://ryoppippi.com/blog/example-article/first-image.png');
		});

		test('builds article schema from the resolved metadata', () => {
			expect(
				articleStructuredData(
					examplePost,
					examplePost.description,
					'https://ryoppippi.com/blog/example-article/',
					'https://ryoppippi.com/assets/content/article-cover.avif',
				),
			).toMatchObject({
				'@type': 'BlogPosting',
				headline: examplePost.title,
				description: examplePost.description,
				datePublished: examplePost.pubDate,
				image: 'https://ryoppippi.com/assets/content/article-cover.avif',
				inLanguage: examplePost.lang,
				author: { '@id': SITE_OWNER.id },
			});
		});

		test('escapes less-than characters in JSON-LD text', () => {
			const [article] = articlePages(
				{
					...examplePost,
					title: '</script><script>alert(1)</script>',
					description: 'A </script> description',
				},
				assets,
			);
			const jsonLd =
				article?.content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ??
				'';
			const visibleTitle = article?.content.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '';

			expect(jsonLd).toContain('\\u003c/script\\u003e');
			expect(jsonLd).not.toContain('</script><script>');
			expect(visibleTitle).toContain('&lt;');
			expect(visibleTitle).not.toContain('</script><script>');
			expect(JSON.parse(jsonLd)).toMatchObject({
				headline: '</script><script>alert(1)</script>',
				description: 'A </script> description',
			});
		});
	});
}

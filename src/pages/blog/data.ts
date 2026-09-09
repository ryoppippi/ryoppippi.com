import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { matter } from 'gray-matter-es';
import {
	createMarkdownProcessor,
	readingTimeMinutes,
	type CollectionEntry,
} from '@ox-content/vite-plugin';
import { glob } from 'tinyglobby';
import type { MarkdownRenderer } from '@/utils/ssg/markdown.ts';
import type { SvelteHtmlHostClientModule } from '@ox-content/vite-plugin-svelte';
import { BLOG_SOURCE_PATTERNS, BLOG_DIRECTORY, CONTENT_DIRECTORY } from '@/config/content.ts';

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
	clientModules: readonly SvelteHtmlHostClientModule[];
	pubDate: string;
	lang: string;
	isPublished: boolean;
	/** Estimated reading duration in minutes, using Ox Content's CJK-aware estimator. */
	readingTime: number;
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

async function loadBlogCollection(): Promise<CollectionEntry[]> {
	return (await import('virtual:ox-content/collections')).queryCollection('blog').all();
}

function collectionEntryBody(entry: CollectionEntry): string {
	if (entry.body == null) {
		throw new Error(`Blog collection must include body: ${entry.source}`);
	}
	return entry.body;
}

async function findBlogPostSource(slug: string, directory: string) {
	if (slug.length === 0 || path.basename(slug) !== slug) {
		return null;
	}
	if (path.resolve(directory) === BLOG_DIRECTORY) {
		const entry = (await loadBlogCollection()).find(
			(candidate) => filenameFor(path.join(CONTENT_DIRECTORY, candidate.source)) === slug,
		);
		if (entry == null) {
			return null;
		}
		const filepath = path.join(CONTENT_DIRECTORY, entry.source);
		return {
			filepath,
			source: await readFile(filepath, 'utf8'),
			data: entry.frontmatter,
			content: collectionEntryBody(entry),
		};
	}

	for (const filepath of [
		path.join(directory, `${slug}.md`),
		path.join(directory, `${slug}.mdx`),
		path.join(directory, slug, 'index.md'),
		path.join(directory, slug, 'index.mdx'),
	]) {
		try {
			const source = await readFile(filepath, 'utf8');
			const { data, content } = matter(source);
			return { filepath, source, data, content };
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
	directory = BLOG_DIRECTORY,
): Promise<string | null> {
	return (await findBlogPostSource(slug, directory))?.source ?? null;
}

/**
 * Loads and renders one article by its safe URL slug.
 *
 * @param slug - Article filename or directory slug.
 * @param renderContent - Host-supplied Markdown renderer.
 * @param directory - Blog source directory.
 * @returns The rendered article, or `null` when the slug does not exist.
 */
export async function loadBlogPost(
	slug: string,
	renderContent: MarkdownRenderer,
	directory = BLOG_DIRECTORY,
): Promise<BlogPost | null> {
	const entry = await findBlogPostSource(slug, directory);
	if (entry == null) {
		return null;
	}

	const rendered = await renderContent(entry.content, {
		documentPath: entry.filepath,
		contentRoot: directory,
	});
	return {
		...parseArticleMetadata(entry.data),
		title: String(entry.data.title),
		filename: filenameFor(entry.filepath),
		filepath: entry.filepath,
		source: entry.source,
		content: entry.content,
		html: rendered.html,
		clientModules: rendered.clientModules,
		pubDate: new Date(String(entry.data.date)).toJSON(),
		lang: typeof entry.data.lang === 'string' ? entry.data.lang : 'ja',
		isPublished: entry.data.isPublished === true,
		readingTime: readingTimeMinutes(entry.content),
	} satisfies BlogPost;
}

/**
 * Loads collection metadata and reading minutes without rendering article HTML.
 *
 * @param directory - Root for entry source paths; custom roots require explicit entries.
 * @param entries - Optional collection entries supplied by a host or fixture.
 * @returns Metadata sorted from newest publication date to oldest.
 */
export async function loadBlogPostMetadata(
	directory = CONTENT_DIRECTORY,
	entries?: readonly CollectionEntry[],
): Promise<BlogPostMetadata[]> {
	if (entries == null && path.resolve(directory) !== CONTENT_DIRECTORY) {
		throw new Error('A custom blog directory requires explicit collection entries');
	}
	const collection = entries ?? (await loadBlogCollection());
	const posts = collection.map((entry) => {
		const data = entry.frontmatter;
		const filepath = path.join(directory, entry.source);
		return {
			...parseArticleMetadata(data),
			title: String(data.title),
			filename: filenameFor(filepath),
			filepath,
			pubDate: new Date(String(data.date)).toJSON(),
			lang: typeof data.lang === 'string' ? data.lang : 'ja',
			isPublished: data.isPublished === true,
			readingTime: readingTimeMinutes(collectionEntryBody(entry)),
		} satisfies BlogPostMetadata;
	});

	return posts.sort((a, b) => b.pubDate.localeCompare(a.pubDate));
}

/**
 * Loads and renders every article in the configured blog directory.
 *
 * @param renderContent - Host-supplied Markdown renderer.
 * @returns Rendered articles sorted from newest publication date to oldest.
 */
export async function loadBlogPosts(renderContent: MarkdownRenderer): Promise<BlogPost[]> {
	const blogDir = BLOG_DIRECTORY;
	const entries = await loadBlogCollection();
	const posts = await Promise.all(
		entries.map(async (entry) => {
			const filepath = path.join(CONTENT_DIRECTORY, entry.source);
			const source = await readFile(filepath, 'utf8');
			const data = entry.frontmatter;
			const content = collectionEntryBody(entry);
			const filename = filenameFor(filepath);
			const rendered = await renderContent(content, {
				documentPath: filepath,
				contentRoot: blogDir,
			});
			return {
				...parseArticleMetadata(data),
				title: String(data.title),
				filename,
				filepath,
				source,
				content,
				html: rendered.html,
				clientModules: rendered.clientModules,
				pubDate: new Date(String(data.date)).toJSON(),
				lang: typeof data.lang === 'string' ? data.lang : 'ja',
				isPublished: data.isPublished === true,
				readingTime: readingTimeMinutes(content),
			} satisfies BlogPost;
		}),
	);

	return posts.sort((a, b) => b.pubDate.localeCompare(a.pubDate));
}

if (import.meta.vitest != null) {
	const processor = createMarkdownProcessor({ highlight: false, embeds: false });
	const renderFixture = (async (source, options) => ({
		...(await processor.render(source, options.documentPath)),
		clientModules: [],
	})) satisfies MarkdownRenderer;
	test('rejects custom directories without their own collection entries', async () => {
		await expect(loadBlogPostMetadata('/different-content')).rejects.toThrow(
			'A custom blog directory requires explicit collection entries',
		);
	});

	test('keeps one central Tweet snapshot for every embedded post', async () => {
		const directory = BLOG_DIRECTORY;
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

	test('returns null for blog paths outside the content directory', async () => {
		const { createFixture } = await import('fs-fixture');
		await using fixture = await createFixture({
			'secret.md': '---\ntitle: Secret\ndate: 2026-06-22\nisPublished: true\n---\nSecret',
			content: {},
		});
		await expect(
			loadBlogPost('../secret', renderFixture, fixture.getPath('content')),
		).resolves.toBeNull();
	});

	test('loads the requested nested-index article', async () => {
		const { createFixture } = await import('fs-fixture');
		await using fixture = await createFixture({
			'first/index.md': '---\ntitle: First\ndate: 2026-06-21\nisPublished: true\n---\nFirst body',
			'second/index.md':
				'---\ntitle: Second\ndate: 2026-06-22\nisPublished: true\n---\nSecond body',
		});
		const post = await loadBlogPost('second', renderFixture, fixture.getPath());

		assert.isNotNull(post);
		expect(post.html).toContain('<p>Second body</p>');
		expect(post.html).not.toContain('First body');
		expect(post).toEqual(expect.objectContaining({ filename: 'second', title: 'Second' }));
	});

	test('loads an MDX post with its document-local islands enabled', async () => {
		const { createFixture } = await import('fs-fixture');
		const { default: FixtureChart } = await import('../404.html/Error.svelte');
		const { createSvelteHtmlHostRenderer } = await import('@ox-content/vite-plugin-svelte');
		await using fixture = await createFixture({
			'component/index.mdx': [
				'---',
				'title: Component post',
				'date: 2026-06-23',
				'isPublished: true',
				'---',
				'',
				"import Chart from './Chart.svelte'",
				'',
				'<Chart />',
			].join('\n'),
			'component/Chart.svelte': '<p>Fixture chart</p>',
		});
		const renderIsland = createSvelteHtmlHostRenderer({
			loadModule: async (moduleId) => {
				expect(moduleId).toBe(fixture.getPath('component/Chart.svelte'));
				return { default: FixtureChart };
			},
			root: fixture.path,
		});

		const post = await loadBlogPost(
			'component',
			async (source, options) => {
				const transformed = await processor.render(source, options.documentPath);
				return renderIsland(transformed.html, { ...options, imports: transformed.imports });
			},
			fixture.path,
		);

		expect(post).toEqual(
			expect.objectContaining({
				filename: 'component',
				title: 'Component post',
				clientModules: [
					{
						name: 'Chart',
						moduleId: '/component/Chart.svelte',
						exportName: 'default',
					},
				],
			}),
		);
		assert.isNotNull(post);
		expect(post.html).toContain('Page not found');
		expect(post.html).toContain('data-ox-ssr="true"');
	});

	test('preserves frontmatter and whitespace in the downloadable Markdown source', async () => {
		const { createFixture } = await import('fs-fixture');
		await using fixture = await createFixture({
			'first.md': '---\ntitle: First\ndate: 2025-01-01\n---\n\nFirst body',
		});

		expect(await loadBlogPostSource('first', fixture.getPath())).toBe(
			'---\ntitle: First\ndate: 2025-01-01\n---\n\nFirst body',
		);
	});

	test('orders metadata newest first and defaults unspecified language and publication status', async () => {
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

		const posts = await loadBlogPostMetadata(fixture.getPath(), [
			{
				id: '2026-06-22',
				collection: 'blog',
				path: '/2026-06-22',
				stem: '2026-06-22/index',
				source: '2026-06-22/index.md',
				extension: '.md',
				title: 'Lazy content',
				frontmatter: { title: 'Lazy content', date: '2026-06-22', isPublished: true, lang: 'en' },
				body: 'Hello world',
			},
			{
				id: 'draft',
				collection: 'blog',
				path: '/draft',
				stem: 'draft/index',
				source: 'draft/index.mdx',
				extension: '.mdx',
				title: 'Draft',
				frontmatter: { title: 'Draft', date: '2026-06-23' },
				body: 'Unpublished',
			},
		]);

		expect(posts).toEqual([
			expect.objectContaining({
				filename: 'draft',
				title: 'Draft',
				lang: 'ja',
				isPublished: false,
				pubDate: '2026-06-23T00:00:00.000Z',
			}),
			expect.objectContaining({
				filename: '2026-06-22',
				isPublished: true,
				lang: 'en',
				title: 'Lazy content',
				pubDate: '2026-06-22T00:00:00.000Z',
			}),
		]);
		expect(posts[0]).not.toHaveProperty('html');
		expect(posts[1]).not.toHaveProperty('html');
	});

	test('parses reusable SEO metadata from article frontmatter', async () => {
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
		await expect(loadBlogPost('article', renderFixture, fixture.getPath())).resolves.toEqual(
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
}

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { matter } from 'gray-matter-es';
import { readingTimeMinutes, type CollectionEntry } from '@ox-content/vite-plugin';
import { glob } from 'tinyglobby';
import type { MarkdownRenderer } from './markdown/render.ts';
import type { SolidHtmlHostClientModule } from '@ox-content/vite-plugin-solid';
import { resolvePostIslands } from './islands.ts';
import { blogDirectory } from './paths.ts';

const BLOG_SOURCE_PATTERNS = ['*.md', '*.mdx', '*/index.md', '*/index.mdx'] as const;

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
	clientModules: readonly SolidHtmlHostClientModule[];
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

async function loadRenderOptions(content: string, filepath: string, directory: string) {
	if (path.extname(filepath).toLowerCase() !== '.mdx') {
		return undefined;
	}
	const islands = await resolvePostIslands(content, filepath, directory);
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
	directory = blogDirectory(),
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
	renderContent?: MarkdownRenderer,
	directory = blogDirectory(),
): Promise<BlogPost | null> {
	const entry = await findBlogPostSource(slug, directory);
	if (entry == null) {
		return null;
	}

	const render = renderContent ?? (await import('./markdown/render.ts')).renderMarkdown;
	const { data, content } = matter(entry.source);
	const renderOptions = await loadRenderOptions(content, entry.filepath, directory);
	const rendered =
		renderOptions == null ? await render(content) : await render(content, renderOptions);
	return {
		...parseArticleMetadata(data),
		title: String(data.title),
		filename: filenameFor(entry.filepath),
		filepath: entry.filepath,
		source: entry.source,
		content,
		html: rendered.html,
		clientModules: rendered.clientModules,
		pubDate: new Date(String(data.date)).toJSON(),
		lang: typeof data.lang === 'string' ? data.lang : 'ja',
		isPublished: data.isPublished === true,
		readingTime: readingTimeMinutes(content),
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
	directory = blogDirectory(),
	entries?: readonly CollectionEntry[],
): Promise<BlogPostMetadata[]> {
	if (entries == null && path.resolve(directory) !== blogDirectory()) {
		throw new Error('A custom blog directory requires explicit collection entries');
	}
	const collection =
		entries ??
		(await (await import('virtual:ox-content/collections')).queryCollection('blog').all());
	const posts = collection.map((entry) => {
		if (entry.body == null) {
			throw new Error(`Blog collection must include body for reading time: ${entry.source}`);
		}
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
			readingTime: readingTimeMinutes(entry.body),
		} satisfies BlogPostMetadata;
	});

	return posts.sort((a, b) => b.pubDate.localeCompare(a.pubDate));
}

/**
 * Loads and renders every article in the configured blog directory.
 *
 * @param renderContent - Optional Markdown renderer used by tests and callers.
 * @returns Rendered articles sorted from newest publication date to oldest.
 */
export async function loadBlogPosts(renderContent?: MarkdownRenderer): Promise<BlogPost[]> {
	const render = renderContent ?? (await import('./markdown/render.ts')).renderMarkdown;
	const blogDir = blogDirectory();
	const files = await glob(BLOG_SOURCE_PATTERNS, { cwd: blogDir, absolute: true });
	const posts = await Promise.all(
		files.map(async (filepath) => {
			const source = await readFile(filepath, 'utf8');
			const { data, content } = matter(source);
			const filename = filenameFor(filepath);
			const renderOptions = await loadRenderOptions(content, filepath, blogDir);
			const rendered =
				renderOptions == null ? await render(content) : await render(content, renderOptions);
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
	describe('blog loaders', () => {
		it('rejects custom directories without their own collection entries', async () => {
			await expect(loadBlogPostMetadata('/different-content')).rejects.toThrow(
				'A custom blog directory requires explicit collection entries',
			);
		});
		it('preserves metadata for every configured source through the collection', async () => {
			const directory = blogDirectory();
			const files = await glob(BLOG_SOURCE_PATTERNS, { cwd: directory, absolute: true });
			const expected = await Promise.all(
				files.map(async (filepath) => {
					const { data, content } = matter(await readFile(filepath, 'utf8'));
					return {
						...parseArticleMetadata(data),
						title: String(data.title),
						filename: filenameFor(filepath),
						filepath,
						pubDate: new Date(String(data.date)).toJSON(),
						lang: typeof data.lang === 'string' ? data.lang : 'ja',
						isPublished: data.isPublished === true,
						readingTime: readingTimeMinutes(content),
					};
				}),
			);

			const actual = await loadBlogPostMetadata();
			expect(actual.map((post) => post.pubDate)).toEqual(
				expected.map((post) => post.pubDate).sort((a, b) => b.localeCompare(a)),
			);
			// Filesystem traversal and collection order need not agree for same-day posts.
			expect(actual.toSorted((a, b) => a.filename.localeCompare(b.filename))).toEqual(
				expected.toSorted((a, b) => a.filename.localeCompare(b.filename)),
			);
		});

		it('uses the same CJK reading minutes for metadata and rendered articles', async () => {
			const { createFixture } = await import('fs-fixture');
			await using fixture = await createFixture({
				'article.md': `---\ntitle: Article\ndate: 2026-06-22\nisPublished: true\n---\n${'文'.repeat(501)}\n\n\`\`\`ts\n${'code '.repeat(1000)}\n\`\`\``,
			});
			const metadata = await loadBlogPostMetadata(fixture.getPath(), [
				{
					id: 'article',
					collection: 'blog',
					path: '/article',
					stem: 'article',
					source: 'article.md',
					extension: '.md',
					title: 'Article',
					frontmatter: { title: 'Article', date: '2026-06-22', isPublished: true },
					body: `${'文'.repeat(501)}\n\n\`\`\`ts\n${'code '.repeat(1000)}\n\`\`\``,
				},
			]);
			const post = await loadBlogPost(
				'article',
				async (content) => ({ html: content, clientModules: [] }),
				fixture.getPath(),
			);

			expect(metadata[0]?.readingTime).toBe(2);
			expect(post?.readingTime).toBe(2);
		});

		it('keeps one central Tweet snapshot for every embedded post', async () => {
			const directory = blogDirectory();
			const cacheDirectory = path.resolve(
				import.meta.dirname,
				'../..',
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
			const renderContent = vi.fn(async (content: string) => ({
				html: content,
				clientModules: [],
			}));

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
			const renderContent = vi.fn(async (content: string) => ({
				html: `<p>${content}</p>`,
				clientModules: [],
			}));

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
			const renderContent = vi.fn(async (content: string) => ({
				html: content,
				clientModules: [
					{
						name: 'Chart',
						moduleId: '/src/content/blog/component/Chart.tsx',
						exportName: 'default',
					},
				],
			}));

			const post = await loadBlogPost('component', renderContent, fixture.getPath());

			expect(post).toEqual(
				expect.objectContaining({
					filename: 'component',
					title: 'Component post',
					clientModules: [
						{
							name: 'Chart',
							moduleId: '/src/content/blog/component/Chart.tsx',
							exportName: 'default',
						},
					],
				}),
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
			]);

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
			const renderContent = vi.fn(async (content: string) => ({
				html: content,
				clientModules: [],
			}));

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
	});
}

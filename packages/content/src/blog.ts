import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { matter } from 'gray-matter-es';
import readingTime from 'reading-time';
import { glob } from 'tinyglobby';
import type { MarkdownRenderer } from './markdown-cache.ts';
import { resolvePostIslands } from './islands.ts';
import { blogDirectory } from './paths.ts';
import { loadOgpSnapshots } from './ogp-snapshots.ts';
import { loadTweetSnapshots } from './tweet-snapshots.ts';

/**
 * SEO metadata that can be declared in an article's frontmatter.
 *
 * @example
 * ```yaml
 * description: A short summary for search results.
 * alternates:
 *   en: https://example.com/en/
 *   ja: https://example.com/ja/
 *   x-default: https://example.com/en/
 * ```
 */
export type ArticleMetadata = {
	description?: string;
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
	return { description, alternates: parseAlternates(data.alternates) };
}

function filenameFor(filepath: string): string {
	return path.basename(filepath) === 'index.md'
		? path.basename(path.dirname(filepath))
		: path.basename(filepath, '.md');
}

async function loadRenderOptions(content: string, filepath: string, directory: string) {
	const [openGraph, tweets, islands] = await Promise.all([
		loadOgpSnapshots(content, filepath),
		loadTweetSnapshots(content, filepath),
		resolvePostIslands(content, filepath, directory),
	]);
	const hasIslands = Object.keys(islands).length > 0;
	return openGraph == null && tweets == null && !hasIslands
		? undefined
		: { openGraph, tweets, islands };
}

async function findBlogPostSource(slug: string, directory: string) {
	if (slug.length === 0 || path.basename(slug) !== slug) {
		return null;
	}

	for (const filepath of [
		path.join(directory, `${slug}.md`),
		path.join(directory, slug, 'index.md'),
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
export async function loadBlogPostMetadata(
	directory = blogDirectory(),
): Promise<BlogPostMetadata[]> {
	const files = await glob(['*.md', '*/index.md'], { cwd: directory, absolute: true });
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
export async function loadBlogPosts(renderContent?: MarkdownRenderer): Promise<BlogPost[]> {
	const render = renderContent ?? (await import('./markdown/render.ts')).renderMarkdown;
	const blogDir = blogDirectory();
	const files = await glob(['*.md', '*/index.md'], { cwd: blogDir, absolute: true });
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

if (import.meta.vitest != null) {
	describe('blog loaders', () => {
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

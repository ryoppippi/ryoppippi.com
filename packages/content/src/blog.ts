import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { matter } from 'gray-matter-es';
import readingTime from 'reading-time';
import { glob } from 'tinyglobby';
import type { MarkdownRenderer } from './markdown-cache.ts';
import { blogDirectory } from './paths.ts';
import { loadOgpSnapshots } from './ogp-snapshots.ts';
import { loadTweetSnapshots } from './tweet-snapshots.ts';

export type BlogPost = {
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

export type BlogPostMetadata = Pick<
	BlogPost,
	'title' | 'filename' | 'filepath' | 'pubDate' | 'lang' | 'isPublished' | 'readingTime'
>;

function filenameFor(filepath: string): string {
	return path.basename(filepath) === 'index.md'
		? path.basename(path.dirname(filepath))
		: path.basename(filepath, '.md');
}

async function loadRenderOptions(content: string, filepath: string) {
	const [openGraph, tweets] = await Promise.all([
		loadOgpSnapshots(content, filepath),
		loadTweetSnapshots(content, filepath),
	]);
	return openGraph == null && tweets == null ? undefined : { openGraph, tweets };
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
	const renderOptions = await loadRenderOptions(content, entry.filepath);
	return {
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

export async function loadBlogPostMetadata(
	directory = blogDirectory(),
): Promise<BlogPostMetadata[]> {
	const files = await glob(['*.md', '*/index.md'], { cwd: directory, absolute: true });
	const posts = await Promise.all(
		files.map(async (filepath) => {
			const source = await readFile(filepath, 'utf8');
			const { data, content } = matter(source);
			return {
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

export async function loadBlogPosts(renderContent?: MarkdownRenderer): Promise<BlogPost[]> {
	const render = renderContent ?? (await import('./markdown/render.ts')).renderMarkdown;
	const blogDir = blogDirectory();
	const files = await glob(['*.md', '*/index.md'], { cwd: blogDir, absolute: true });
	const posts = await Promise.all(
		files.map(async (filepath) => {
			const source = await readFile(filepath, 'utf8');
			const { data, content } = matter(source);
			const filename = filenameFor(filepath);
			const renderOptions = await loadRenderOptions(content, filepath);
			return {
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
	});
}

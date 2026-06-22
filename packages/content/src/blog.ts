import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { matter } from 'gray-matter-es';
import readingTime from 'reading-time';
import { glob } from 'tinyglobby';
import { renderMarkdown } from './markdown/render.ts';
import type { MarkdownRenderer } from './markdown-cache.ts';
import { blogDirectory } from './paths.ts';

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

function filenameFor(filepath: string): string {
	return path.basename(filepath) === 'index.md'
		? path.basename(path.dirname(filepath))
		: path.basename(filepath, '.md');
}

export async function loadBlogPosts(
	renderContent: MarkdownRenderer = renderMarkdown,
): Promise<BlogPost[]> {
	const blogDir = blogDirectory();
	const files = await glob(['*.md', '*/index.md'], { cwd: blogDir, absolute: true });
	const posts = await Promise.all(
		files.map(async (filepath) => {
			const source = await readFile(filepath, 'utf8');
			const { data, content } = matter(source);
			const filename = filenameFor(filepath);
			return {
				title: String(data.title),
				filename,
				filepath,
				source,
				content,
				html: await renderContent(content),
				pubDate: new Date(String(data.date)).toJSON(),
				lang: typeof data.lang === 'string' ? data.lang : 'ja',
				isPublished: data.isPublished === true,
				readingTime: readingTime(content),
			} satisfies BlogPost;
		}),
	);

	return posts.sort((a, b) => b.pubDate.localeCompare(a.pubDate));
}

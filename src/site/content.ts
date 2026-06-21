import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { matter } from 'gray-matter-es';
import readingTime from 'reading-time';
import Parser from 'rss-parser';
import { glob } from 'tinyglobby';
import { renderMarkdown } from '../markdown/render.ts';

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

export type PostListItem = {
	title: string;
	slug: string;
	link: string;
	pubDate: string;
	lang: string;
	external: boolean;
};

function filenameFor(filepath: string): string {
	return path.basename(filepath) === 'index.md'
		? path.basename(path.dirname(filepath))
		: path.basename(filepath, '.md');
}

export async function loadBlogPosts(root = process.cwd()): Promise<BlogPost[]> {
	const blogDir = path.join(root, 'src/contents/blog');
	const files = await glob(['*.md', '*/index.md'], { cwd: blogDir, absolute: true });
	const posts = await Promise.all(files.map(async (filepath) => {
		const source = await readFile(filepath, 'utf8');
		const { data, content } = matter(source);
		const filename = filenameFor(filepath);
		return {
			title: String(data.title),
			filename,
			filepath,
			source,
			content,
			html: await renderMarkdown(content),
			pubDate: new Date(String(data.date)).toJSON(),
			lang: typeof data.lang === 'string' ? data.lang : 'ja',
			isPublished: data.isPublished === true,
			readingTime: readingTime(content),
		} satisfies BlogPost;
	}));

	return posts.sort((a, b) => b.pubDate.localeCompare(a.pubDate));
}

export async function loadExternalPosts(root = process.cwd()): Promise<PostListItem[]> {
	const sources = JSON.parse(await readFile(path.join(root, 'src/contents/external-rss/rss.json'), 'utf8')) as string[];
	const parser = new Parser();
	const feeds = await Promise.allSettled(sources.map(async source => parser.parseURL(source)));
	return feeds.flatMap((result) => {
		if (result.status === 'rejected') {
			console.warn(`Skipping external RSS feed: ${String(result.reason)}`);
			return [];
		}
		return result.value.items.flatMap((item) => {
			if (item.title == null || item.link == null || item.pubDate == null) {
				return [];
			}
			return [{
				title: item.title,
				slug: item.guid ?? item.link,
				link: item.link,
				pubDate: new Date(item.pubDate).toJSON(),
				lang: 'ja',
				external: true,
			}];
		});
	});
}

export function postListItems(posts: BlogPost[]): PostListItem[] {
	return posts.filter(post => post.isPublished).map(post => ({
		title: post.title,
		slug: post.filename,
		link: `/blog/${post.filename}/`,
		pubDate: post.pubDate,
		lang: post.lang,
		external: false,
	}));
}

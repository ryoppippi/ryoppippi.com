import type { BlogPostMetadata } from '@ryoppippi/content';
import { readFile } from 'node:fs/promises';
import process from 'node:process';
import Parser from 'rss-parser';
import path from 'node:path';

export type PostListItem = {
	title: string;
	slug: string;
	link: string;
	pubDate: string;
	lang: string;
	external: boolean;
	draft?: boolean;
};

export async function loadExternalPosts(root = process.cwd()): Promise<PostListItem[]> {
	const sources = JSON.parse(
		await readFile(path.join(root, 'src/contents/external-rss/rss.json'), 'utf8'),
	) as string[];
	const parser = new Parser();
	const feeds = await Promise.allSettled(sources.map(async (source) => parser.parseURL(source)));
	return feeds.flatMap((result) => {
		if (result.status === 'rejected') {
			console.warn(`Skipping external RSS feed: ${String(result.reason)}`);
			return [];
		}
		return result.value.items.flatMap((item) => {
			if (item.title == null || item.link == null || item.pubDate == null) {
				return [];
			}
			return [
				{
					title: item.title,
					slug: item.guid ?? item.link,
					link: item.link,
					pubDate: new Date(item.pubDate).toJSON(),
					lang: 'ja',
					external: true,
				},
			];
		});
	});
}

/**
 * Converts blog post metadata into blog list entries.
 *
 * @param posts - Blog post metadata to list
 * @param options - Set `includeDrafts` to keep unpublished posts (used by the
 * dev server so drafts appear with a draft mark)
 * @returns List items for the blog index page
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
			link: `/blog/${post.filename}/`,
			pubDate: post.pubDate,
			lang: post.lang,
			external: false,
			draft: !post.isPublished,
		}));
}

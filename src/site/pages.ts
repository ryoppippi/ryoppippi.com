import type { BlogPost, BlogPostMetadata } from '@ryoppippi/content';
import type { SiteAssets } from './assets.ts';
import type { PostListItem } from './content.ts';
import { Feed } from 'feed';
import { formatDate } from '../lib/util.ts';
import { postListItems } from './content.ts';
import { page, renderComponent } from './html.ts';
import Article from './templates/Article.svelte';
import BlogList from './templates/BlogList.svelte';
import Home from './templates/Home.svelte';

export type GeneratedFile = {
	path: string;
	content: string;
};

export function homePage(assets: SiteAssets): GeneratedFile {
	return {
		path: 'index.html',
		content: page({
			title: 'home',
			pathname: '/',
			content: renderComponent(Home, {}),
			assets,
			style: 'home',
		}),
	};
}

export function blogListPage(items: PostListItem[], assets: SiteAssets): GeneratedFile {
	const sorted = items.toSorted((a, b) => b.pubDate.localeCompare(a.pubDate));
	return {
		path: 'blog/index.html',
		content: page({
			title: 'blog',
			pathname: '/blog/',
			content: renderComponent(BlogList, { items: sorted }),
			assets,
			style: 'blog',
		}),
	};
}

export function articlePages(post: BlogPost, assets: SiteAssets): GeneratedFile[] {
	const pathname = `/blog/${post.filename}/`;
	const content = renderComponent(Article, {
		date: formatDate(new Date(post.pubDate)),
		pathname,
		post,
	});
	return [
		{
			path: `blog/${post.filename}/index.html`,
			content: page({
				title: `${post.title} | blog`,
				pathname,
				content,
				assets,
				article: true,
				style: 'article',
				tweet: post.html.includes('data-tweet-id'),
			}),
		},
		{ path: `blog/${post.filename}.md`, content: post.source },
	];
}

export function feed(posts: BlogPostMetadata[]): GeneratedFile {
	const output = new Feed({
		title: 'blog | ryoppippi.com',
		description: 'blog | ryoppippi.com',
		id: 'https://ryoppippi.com',
		link: 'https://ryoppippi.com',
		language: 'en',
		image: 'https://ryoppippi.com/ryoppippi.jpg',
		favicon: 'https://ryoppippi.com/ryoppippi.jpg',
		copyright: 'CC BY-NC-SA 4.0 2022-PRESENT © ryoppippi',
		feedLinks: { rss: 'https://ryoppippi.com/feed.xml' },
	});
	for (const post of posts.filter((post) => post.isPublished)) {
		output.addItem({
			title: post.title,
			link: `https://ryoppippi.com/blog/${post.filename}/`,
			date: new Date(post.pubDate),
			description: `${post.title} | ${post.readingTime.text}`,
		});
	}
	return { path: 'feed.xml', content: output.rss2() };
}

export function corePages(
	posts: BlogPost[],
	externalPosts: PostListItem[],
	assets: SiteAssets,
): GeneratedFile[] {
	return [
		homePage(assets),
		blogListPage([...externalPosts, ...postListItems(posts)], assets),
		...posts.filter((post) => post.isPublished).flatMap((post) => articlePages(post, assets)),
		feed(posts),
	];
}

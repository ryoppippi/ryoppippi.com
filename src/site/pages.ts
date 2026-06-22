import type { BlogPost } from '@ryoppippi/content';
import type { PostListItem } from './content.ts';
import { Feed } from 'feed';
import { formatDate } from '../lib/util.ts';
import { page, renderComponent } from './html.ts';
import Article from './templates/Article.svelte';
import BlogList from './templates/BlogList.svelte';
import Home from './templates/Home.svelte';

export type GeneratedFile = {
	path: string;
	content: string;
};

function home(assets: string): GeneratedFile {
	return {
		path: 'index.html',
		content: page({ title: 'home', pathname: '/', content: renderComponent(Home, {}), assets }),
	};
}

function blogList(items: PostListItem[], assets: string): GeneratedFile {
	const sorted = items.toSorted((a, b) => b.pubDate.localeCompare(a.pubDate));
	return {
		path: 'blog/index.html',
		content: page({
			title: 'blog',
			pathname: '/blog/',
			content: renderComponent(BlogList, { items: sorted }),
			assets,
		}),
	};
}

function article(post: BlogPost, assets: string): GeneratedFile[] {
	const pathname = `/blog/${post.filename}/`;
	const content = renderComponent(Article, {
		date: formatDate(new Date(post.pubDate)),
		pathname,
		post,
	});
	return [
		{
			path: `blog/${post.filename}/index.html`,
			content: page({ title: `${post.title} | blog`, pathname, content, assets, article: true }),
		},
		{ path: `blog/${post.filename}.md`, content: post.source },
	];
}

export function feed(posts: BlogPost[]): GeneratedFile {
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
	assets: string,
): GeneratedFile[] {
	const localPosts = posts
		.filter((post) => post.isPublished)
		.map((post) => ({
			title: post.title,
			slug: post.filename,
			link: `/blog/${post.filename}/`,
			pubDate: post.pubDate,
			lang: post.lang,
			external: false,
		}));
	return [
		home(assets),
		blogList([...externalPosts, ...localPosts], assets),
		...posts.filter((post) => post.isPublished).flatMap((post) => article(post, assets)),
		feed(posts),
	];
}

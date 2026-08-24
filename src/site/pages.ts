import type { ArticleMetadata, BlogPost, BlogPostMetadata } from '@ryoppippi/content';
import type { SiteAssets } from './assets.ts';
import type { PostListItem } from './content.ts';
import { Feed } from 'feed';
import { formatDate } from '../lib/util.ts';
import { islandModuleIds } from './assets.ts';
import { postListItems } from './content.ts';
import { page, renderComponent } from './html.ts';
import Article from './templates/Article.svelte';
import BlogList from './templates/BlogList.svelte';
import Home from './templates/Home.svelte';
import { siteOrigin } from './site-origin.ts';

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
		alternates: post.alternates,
	};
}

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

/**
 * Renders the HTML and Markdown-source files for one article.
 *
 * @param post - Rendered article and its frontmatter metadata.
 * @param assets - Site assets used by the article template.
 * @returns The published HTML page and its source companion file.
 */
export function articlePages(post: BlogPost, assets: SiteAssets): GeneratedFile[] {
	const pathname = `/blog/${post.filename}/`;
	const url = `${siteOrigin}${pathname}`;
	const metadata = articleSeoMetadata(post);
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
				description: metadata.description,
				lang: post.lang,
				alternates: metadata.alternates,
				assets,
				article: true,
				islands: islandModuleIds(post.html),
				style: 'article',
				tweet: post.html.includes('data-tweet-id'),
				structuredData: {
					'@context': 'https://schema.org',
					'@type': 'BlogPosting',
					headline: post.title,
					description: metadata.description,
					url,
					mainEntityOfPage: { '@type': 'WebPage', '@id': url },
					author: { '@type': 'Person', name: 'ryoppippi', url: siteOrigin },
					datePublished: post.pubDate,
					inLanguage: post.lang,
				},
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

if (import.meta.vitest != null) {
	const assets = {
		base: '',
		client: '',
		islands: {},
		pages: { article: '', blog: '', error: '', home: '', sponsors: '', works: '' },
		tweet: '',
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
		lang: 'en',
		isPublished: true,
		readingTime: { text: '1 min read', minutes: 1, time: 60_000, words: 100 },
	} satisfies BlogPost;

	test('renders article SEO metadata and reciprocal language links', () => {
		const [article] = articlePages(examplePost, assets);
		expect(article).toBeDefined();
		const html = article?.content ?? '';

		expect(html).toContain('<html lang="en">');
		expect(html).toContain(
			'<meta data-page-head="" name="description" content="A concise description for an example article."/>',
		);
		expect(html).toContain(
			'<meta data-page-head="" name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"/>',
		);
		expect(html).toContain(
			'<link data-page-head="" rel="canonical" href="https://ryoppippi.com/blog/example-article/"/>',
		);
		for (const [language, url] of Object.entries(examplePost.alternates)) {
			expect(html).toContain(
				`<link data-page-head="" rel="alternate" hreflang="${language}" href="${url}"/>`,
			);
		}

		const jsonLd = html.match(
			/<script data-page-head type="application\/ld\+json">([\s\S]*?)<\/script>/,
		)?.[1];
		expect(jsonLd).toBeDefined();
		expect(JSON.parse(jsonLd ?? '')).toMatchObject({
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: examplePost.title,
			description: examplePost.description,
			url: 'https://ryoppippi.com/blog/example-article/',
			mainEntityOfPage: {
				'@type': 'WebPage',
				'@id': 'https://ryoppippi.com/blog/example-article/',
			},
			datePublished: examplePost.pubDate,
			inLanguage: 'en',
		});
	});

	test('uses the first prose paragraph when description frontmatter is absent', () => {
		const [article] = articlePages(
			{
				...examplePost,
				description: undefined,
				content: '# Heading\n\nA useful fallback paragraph with [a link](https://example.com).',
			},
			assets,
		);

		expect(article?.content).toContain(
			'<meta data-page-head="" name="description" content="A useful fallback paragraph with a link."/>',
		);
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
			article?.content.match(
				/<script data-page-head type="application\/ld\+json">([\s\S]*?)<\/script>/,
			)?.[1] ?? '';

		expect(jsonLd).toContain('\\u003c/script>');
		expect(jsonLd).not.toContain('</script><script>');
		expect(JSON.parse(jsonLd)).toMatchObject({
			headline: '</script><script>alert(1)</script>',
			description: 'A </script> description',
		});
	});
}

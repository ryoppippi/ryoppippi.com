import type { ArticleMetadata, BlogPost, BlogPostMetadata } from '@ryoppippi/content';
import type { SiteAssets } from './assets.ts';
import type { PostListItem } from './content.ts';
import { Feed } from 'feed';
import { formatDate } from '../lib/util.ts';
import { islandModuleIds } from './assets.ts';
import { SITE_COPYRIGHT, SITE_NAME, SITE_ORIGIN, SITE_SOCIAL_IMAGE_URL } from './consts.ts';
import { postListItems } from './content.ts';
import path from 'node:path';
import { page, renderComponent } from './html.ts';
import Article from './templates/Article.svelte';
import BlogList from './templates/BlogList.svelte';
import Home from './templates/Home.svelte';

type ArticleSeoMetadata = ArticleMetadata & { description: string };

const HOME_DESCRIPTION =
	'Portfolio and technical blog of @ryoppippi, featuring open-source projects, talks, publications, and software engineering articles.';

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
		image: post.image,
		alternates: post.alternates,
	};
}

function articleImageUrl(html: string, articleUrl: string): string | undefined {
	const source = html.match(/<img src="([^"]+)"/)?.[1];
	return source == null
		? undefined
		: new URL(
				source.replaceAll('&amp;', '&').replaceAll('&#x26;', '&').replaceAll('&#38;', '&'),
				articleUrl,
			).href;
}

/**
 * A file emitted by the static site generator.
 */
export type GeneratedFile = {
	/** Relative path below the generated site directory. */
	path: string;
	/** Serialized file contents. */
	content: string;
	/** Repository paths whose meaningful changes update the generated file. */
	sourcePaths?: readonly string[];
};

/**
 * Renders the site home page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated home page.
 */
export function homePage(assets: SiteAssets): GeneratedFile {
	return {
		path: 'index.html',
		sourcePaths: ['src/site/templates/Home.svelte'],
		content: page({
			title: '',
			pathname: '/',
			content: renderComponent(Home, {}),
			description: HOME_DESCRIPTION,
			assets,
			style: 'home',
			structuredData: {
				'@context': 'https://schema.org',
				'@type': 'WebSite',
				'@id': `${SITE_ORIGIN}/#website`,
				name: SITE_NAME,
				alternateName: '@ryoppippi',
				description: HOME_DESCRIPTION,
				url: SITE_ORIGIN,
			},
		}),
	};
}

/**
 * Renders the blog index page.
 *
 * @param items - Local and external posts to list.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated blog index page.
 */
export function blogListPage(items: PostListItem[], assets: SiteAssets): GeneratedFile {
	const sorted = items.toSorted((a, b) => b.pubDate.localeCompare(a.pubDate));
	return {
		path: 'blog/index.html',
		sourcePaths: [
			'src/site/content.ts',
			'src/site/templates/BlogList.svelte',
			'packages/content/src/blog',
			'src/contents/external-rss/rss.json',
			'src/contents/external-rss/posts.json',
			'src/contents/external-rss/media.json',
		],
		content: page({
			title: 'Blog',
			pathname: '/blog/',
			content: renderComponent(BlogList, { items: sorted }),
			description:
				'Technical articles by @ryoppippi about software engineering, developer tooling, open source, and AI.',
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
	const url = `${SITE_ORIGIN}${pathname}`;
	const metadata = articleSeoMetadata(post);
	const image =
		metadata.image == null ? articleImageUrl(post.html, url) : new URL(metadata.image, url).href;
	const content = renderComponent(Article, {
		date: formatDate(new Date(post.pubDate)),
		pathname,
		post,
	});
	const sourcePath =
		path.basename(post.filepath) === 'index.md' ? path.dirname(post.filepath) : post.filepath;
	return [
		{
			path: `blog/${post.filename}/index.html`,
			sourcePaths: [sourcePath],
			content: page({
				title: `${post.title} | blog`,
				pathname,
				content,
				description: metadata.description,
				datePublished: post.pubDate,
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
					author: { '@type': 'Person', name: 'ryoppippi', url: SITE_ORIGIN },
					datePublished: post.pubDate,
					...(image == null ? {} : { image }),
					inLanguage: post.lang,
				},
			}),
		},
		{ path: `blog/${post.filename}.md`, content: post.source },
	];
}

/**
 * Builds the RSS feed for published local posts.
 *
 * @param posts - Blog post metadata to include.
 * @returns The generated RSS feed.
 */
export function feed(posts: BlogPostMetadata[]): GeneratedFile {
	const output = new Feed({
		title: `blog | ${SITE_NAME}`,
		description: `blog | ${SITE_NAME}`,
		id: SITE_ORIGIN,
		link: SITE_ORIGIN,
		language: 'en',
		image: SITE_SOCIAL_IMAGE_URL,
		favicon: SITE_SOCIAL_IMAGE_URL,
		copyright: SITE_COPYRIGHT,
		feedLinks: { rss: `${SITE_ORIGIN}/feed.xml` },
	});
	for (const post of posts.filter((post) => post.isPublished)) {
		output.addItem({
			title: post.title,
			link: `${SITE_ORIGIN}/blog/${post.filename}/`,
			date: new Date(post.pubDate),
			description: `${post.title} | ${post.readingTime.text}`,
		});
	}
	return { path: 'feed.xml', content: output.rss2() };
}

/**
 * Renders the generated core pages for the site.
 *
 * @param posts - Rendered local blog posts.
 * @param externalPosts - Posts loaded from configured external feeds.
 * @param assets - Bundled site assets referenced by the pages.
 * @returns The generated core files.
 */
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
		image: '/assets/content/article-cover.avif',
		lang: 'en',
		isPublished: true,
		readingTime: { text: '1 min read', minutes: 1, time: 60_000, words: 100 },
	} satisfies BlogPost;

	test('renders site identity metadata on the home page', () => {
		const html = homePage(assets).content;
		expect(html).toContain(
			`<meta data-page-head="" name="description" content="${HOME_DESCRIPTION}">`,
		);
		expect(html).not.toContain('data-home-description');
		expect(html).toMatch(/<span data-nosnippet(?:="")?><a class="skip-link"/);
		expect(html).toMatch(/<div data-nosnippet(?:="")? class="flex flex-wrap justify-center/);
		expect(html).toContain('<meta data-page-head="" property="og:title" content="ryoppippi.com">');
		expect(html).toContain('"@type":"WebSite"');
	});

	test('renders article SEO metadata and reciprocal language links', () => {
		const [article] = articlePages(examplePost, assets);
		expect(article).toBeDefined();
		expect(article?.sourcePaths).toEqual(['/content/example-article']);
		const html = article?.content ?? '';

		expect(html).toContain('<html lang="en">');
		expect(html).toContain(
			'<meta data-page-head="" name="description" content="A concise description for an example article.">',
		);
		expect(html).toContain(
			'<meta data-page-head="" property="og:title" content="Example article | blog | ryoppippi.com">',
		);
		expect(html).toContain(
			'<meta data-page-head="" property="og:description" content="A concise description for an example article.">',
		);
		expect(html).toContain(
			'<meta data-page-head="" name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">',
		);
		expect(html).toContain(
			'<link data-page-head="" rel="canonical" href="https://ryoppippi.com/blog/example-article/">',
		);
		expect(html).toContain(
			'<meta data-page-head="" property="article:published_time" content="2026-01-01T00:00:00.000Z">',
		);
		for (const [language, url] of Object.entries(examplePost.alternates)) {
			expect(html).toContain(
				`<link data-page-head="" hreflang="${language}" href="${url}" rel="alternate">`,
			);
		}

		const jsonLd = html.match(
			/<script data-page-head="" type="application\/ld\+json">([\s\S]*?)<\/script>/,
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
			image: 'https://ryoppippi.com/assets/content/article-cover.avif',
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
			'<meta data-page-head="" name="description" content="A useful fallback paragraph with a link.">',
		);
	});

	test('uses the first rendered article image in JSON-LD', () => {
		const [article] = articlePages(
			{
				...examplePost,
				image: undefined,
				html: '<p><img src="./first-image.png" alt="Example"></p>',
			},
			assets,
		);

		expect(article?.content).toContain(
			'"image":"https://ryoppippi.com/blog/example-article/first-image.png"',
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
				/<script data-page-head="" type="application\/ld\+json">([\s\S]*?)<\/script>/,
			)?.[1] ?? '';

		expect(jsonLd).toContain('\\u003C/script>');
		expect(jsonLd).not.toContain('</script><script>');
		expect(JSON.parse(jsonLd)).toMatchObject({
			headline: '</script><script>alert(1)</script>',
			description: 'A </script> description',
		});
	});
}

import type { ArticleMetadata, BlogPost } from '../content/index.ts';
import type { SiteAssets } from './assets.ts';
import type { PostListItem } from './content.ts';
import * as ufo from 'ufo';
import { formatDate } from '../lib/util.ts';
import { islandModuleIds } from './assets.ts';
import { SITE_NAME, SITE_ORIGIN, SITE_SOCIAL_IMAGE_URL } from './consts.ts';
import { postListItems } from './content.ts';
import path from 'node:path';
import { page, renderComponent } from './html.ts';
import { SITE_OWNER } from './site-owner.ts';
import Article from './templates/Article.tsx';
import BlogList from './templates/BlogList.tsx';
import Home from './templates/Home.tsx';

type ArticleSeoMetadata = ArticleMetadata & { description: string };

const SITE_OWNER_SOURCE_PATH = 'src/site/site-owner.ts';
const HOME_DESCRIPTION = `Portfolio and technical blog of ${SITE_OWNER.name} (${SITE_OWNER.japaneseName}), known as ${SITE_OWNER.handle}, featuring open-source projects, talks, publications, and software engineering articles.`;

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

function homeStructuredData() {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebSite',
				'@id': ufo.withFragment(ufo.withTrailingSlash(SITE_ORIGIN), 'website'),
				name: SITE_NAME,
				alternateName: SITE_OWNER.handle,
				description: HOME_DESCRIPTION,
				url: SITE_OWNER.url,
				creator: { '@id': SITE_OWNER.id },
			},
			{
				'@type': 'ProfilePage',
				'@id': ufo.withFragment(ufo.withTrailingSlash(SITE_ORIGIN), 'profile'),
				url: SITE_OWNER.url,
				isPartOf: {
					'@id': ufo.withFragment(ufo.withTrailingSlash(SITE_ORIGIN), 'website'),
				},
				mainEntity: { '@id': SITE_OWNER.id },
			},
			{
				'@type': 'Person',
				'@id': SITE_OWNER.id,
				name: SITE_OWNER.name,
				alternateName: [
					SITE_OWNER.japaneseName,
					SITE_OWNER.formerName,
					SITE_OWNER.formerJapaneseName,
					SITE_OWNER.handle,
					'ryoppippi',
				],
				url: SITE_OWNER.url,
				image: SITE_SOCIAL_IMAGE_URL,
				sameAs: [...SITE_OWNER.sameAs],
			},
		],
	};
}

function articleStructuredData(
	post: BlogPost,
	description: string,
	url: string,
	image: string | undefined,
) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.title,
		description,
		url,
		mainEntityOfPage: { '@type': 'WebPage', '@id': url },
		author: {
			'@type': 'Person',
			'@id': SITE_OWNER.id,
			name: SITE_OWNER.name,
			alternateName: [SITE_OWNER.japaneseName, SITE_OWNER.handle],
			url: SITE_OWNER.url,
		},
		datePublished: post.pubDate,
		...(image == null ? {} : { image }),
		inLanguage: post.lang,
	};
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
		sourcePaths: [SITE_OWNER_SOURCE_PATH, 'src/site/templates/Home.tsx'],
		content: page({
			title: '',
			pathname: '/',
			content: renderComponent(Home, {}),
			description: HOME_DESCRIPTION,
			assets,
			style: 'home',
			structuredData: homeStructuredData(),
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
			'src/site/templates/BlogList.tsx',
			'src/content/blog',
			'src/contents/external-rss/rss.json',
			'src/contents/external-rss/posts.json',
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
	const url = ufo.joinURL(SITE_ORIGIN, pathname);
	const metadata = articleSeoMetadata(post);
	const image =
		metadata.image == null ? articleImageUrl(post.html, url) : new URL(metadata.image, url).href;
	const content = renderComponent(Article, {
		date: formatDate(new Date(post.pubDate)),
		pathname,
		post,
	});
	const sourcePath = /^index\.mdx?$/.test(path.basename(post.filepath))
		? path.dirname(post.filepath)
		: post.filepath;
	return [
		{
			path: `blog/${post.filename}/index.html`,
			sourcePaths: [SITE_OWNER_SOURCE_PATH, sourcePath],
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
				structuredData: articleStructuredData(post, metadata.description, url, image),
			}),
		},
		{ path: `blog/${post.filename}.md`, content: post.source },
	];
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
	];
}

if (import.meta.vitest != null) {
	const assets = {
		base: '',
		client: '',
		islands: {},
		oxContent: '',
		pages: { about: '', article: '', blog: '', error: '', home: '', sponsors: '', works: '' },
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

	test('tracks the whole source directory for an index MDX article', () => {
		const [article] = articlePages(
			{ ...examplePost, filepath: '/content/example-article/index.mdx' },
			assets,
		);

		expect(article.sourcePaths).toContain('/content/example-article');
		expect(article.sourcePaths).not.toContain('/content/example-article/index.mdx');
	});

	test('derives an article description from the first prose paragraph', () => {
		expect(
			markdownDescription(
				'# Heading\n\nA useful fallback paragraph with [a link](https://example.com).',
			),
		).toBe('A useful fallback paragraph with a link.');
	});

	test('resolves the first rendered article image against the article URL', () => {
		expect(
			articleImageUrl(
				'<p><img src="./first-image.png" alt="Example"></p>',
				'https://ryoppippi.com/blog/example-article/',
			),
		).toBe('https://ryoppippi.com/blog/example-article/first-image.png');
	});

	test('builds the owner relationship graph', () => {
		expect(homeStructuredData()).toMatchObject({
			'@graph': expect.arrayContaining([
				expect.objectContaining({
					'@type': 'ProfilePage',
					mainEntity: { '@id': SITE_OWNER.id },
				}),
				expect.objectContaining({
					'@type': 'Person',
					'@id': SITE_OWNER.id,
					name: SITE_OWNER.name,
					sameAs: SITE_OWNER.sameAs,
				}),
			]),
		});
	});

	test('builds article schema from the resolved metadata', () => {
		expect(
			articleStructuredData(
				examplePost,
				examplePost.description,
				'https://ryoppippi.com/blog/example-article/',
				'https://ryoppippi.com/assets/content/article-cover.avif',
			),
		).toMatchObject({
			'@type': 'BlogPosting',
			headline: examplePost.title,
			description: examplePost.description,
			datePublished: examplePost.pubDate,
			image: 'https://ryoppippi.com/assets/content/article-cover.avif',
			inLanguage: examplePost.lang,
			author: { '@id': SITE_OWNER.id },
		});
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
			article?.content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ??
			'';
		const visibleTitle = article?.content.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '';

		expect(jsonLd).toContain('\\u003c/script\\u003e');
		expect(jsonLd).not.toContain('</script><script>');
		expect(visibleTitle).toContain('&lt;');
		expect(visibleTitle).not.toContain('</script><script>');
		expect(JSON.parse(jsonLd)).toMatchObject({
			headline: '</script><script>alert(1)</script>',
			description: 'A </script> description',
		});
	});
}

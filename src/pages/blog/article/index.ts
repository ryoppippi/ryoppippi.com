import type { ArticleMetadata, BlogPost } from '@/content/index.ts';
import { formatDate } from '@/lib/util.ts';
import { islandModuleIds, type SiteAssets } from '@/rendering/site-assets.ts';
import { SITE_ORIGIN } from '@/config/site.ts';
import { definePage } from '@/generation/define-page.ts';
import type { GeneratedFile } from '@/generation/generated-file.ts';
import { SITE_OWNER } from '@/config/site-owner.ts';
import * as ufo from 'ufo';
import path from 'node:path';
import ArticlePage from './page.tsx';

type ArticleSeoMetadata = ArticleMetadata & { description: string };

const SITE_OWNER_SOURCE_PATH = 'src/config/site-owner.ts';

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
 * Renders the HTML and Markdown-source files for one article.
 *
 * @param post - Rendered article and its frontmatter metadata.
 * @param assets - Site assets used by the article page.
 * @returns The published HTML page and its source companion file.
 */
export function createArticlePageFiles(post: BlogPost, assets: SiteAssets): GeneratedFile[] {
	const pathname = `/blog/${post.filename}/`;
	const url = ufo.joinURL(SITE_ORIGIN, pathname);
	const metadata = articleSeoMetadata(post);
	const image =
		metadata.image == null ? articleImageUrl(post.html, url) : new URL(metadata.image, url).href;
	const sourcePath = /^index\.mdx?$/.test(path.basename(post.filepath))
		? path.dirname(post.filepath)
		: post.filepath;
	return [
		definePage({
			component: ArticlePage,
			componentProps: {
				date: formatDate(new Date(post.pubDate)),
				pathname,
				post,
			},
			outputPath: `blog/${post.filename}/index.html`,
			sourcePaths: [SITE_OWNER_SOURCE_PATH, 'src/pages/blog/article', sourcePath],
			title: `${post.title} | blog`,
			pathname,
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
		{ path: `blog/${post.filename}.md`, content: post.source },
	];
}

if (import.meta.vitest != null) {
	const assets = {
		base: '',
		client: '',
		islands: {},
		oxContent: '',
		pageStyles: { about: '', article: '', blog: '', error: '', home: '', sponsors: '', works: '' },
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
		readingTime: 1,
	} satisfies BlogPost;

	test('tracks the whole source directory for an index MDX article', () => {
		const [article] = createArticlePageFiles(
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
		const [article] = createArticlePageFiles(
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

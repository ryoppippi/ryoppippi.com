import type { BlogPost } from '@ryoppippi/content';
import type { SiteAssets } from './assets.ts';
import { articlePages } from './pages.ts';

const assets = {
	base: '',
	client: '',
	islands: {},
	pages: { article: '', blog: '', error: '', home: '', sponsors: '', works: '' },
	tweet: '',
} as const satisfies SiteAssets;

const gtvPost = {
	title: 'How Open Source Got Me a UK Global Talent Visa (Exceptional Talent)',
	description:
		"How I used open-source work, recommendation letters, and evidence of impact to earn the UK's Global Talent Visa as an Exceptional Talent.",
	alternates: {
		ja: 'https://ryoppippi.com/blog/2026-07-30-uk-gtv-ja/',
		en: 'https://ryoppippi.com/blog/2026-08-15-uk-gtv-en/',
		'x-default': 'https://ryoppippi.com/blog/2026-08-15-uk-gtv-en/',
	},
	filename: '2026-08-15-uk-gtv-en',
	filepath: '/content/2026-08-15-uk-gtv-en/index.md',
	source: '---\ntitle: Example\n---\nBody',
	content: 'A concise article summary.',
	html: '<p>A concise article summary.</p>',
	pubDate: '2026-08-15T00:00:00.000Z',
	lang: 'en',
	isPublished: true,
	readingTime: { text: '1 min read', minutes: 1, time: 60_000, words: 100 },
} satisfies BlogPost;

describe(articlePages, () => {
	it('renders article SEO metadata and reciprocal language links', () => {
		const [article] = articlePages(gtvPost, assets);
		expect(article).toBeDefined();
		const html = article?.content ?? '';

		expect(html).toContain('<html lang="en">');
		expect(html).toContain(
			'<meta data-page-head="" name="description" content="How I used open-source work, recommendation letters, and evidence of impact to earn the UK\'s Global Talent Visa as an Exceptional Talent."/>',
		);
		expect(html).toContain(
			'<meta data-page-head="" name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"/>',
		);
		expect(html).toContain(
			'<link data-page-head="" rel="canonical" href="https://ryoppippi.com/blog/2026-08-15-uk-gtv-en/"/>',
		);
		for (const [language, url] of Object.entries(gtvPost.alternates)) {
			expect(html).toContain(
				`<link data-page-head="" rel="alternate" hreflang="${language}" href="${url}"/>`,
			);
		}

		const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
		expect(jsonLd).toBeDefined();
		expect(JSON.parse(jsonLd ?? '')).toMatchObject({
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: gtvPost.title,
			description: gtvPost.description,
			url: 'https://ryoppippi.com/blog/2026-08-15-uk-gtv-en/',
			mainEntityOfPage: {
				'@type': 'WebPage',
				'@id': 'https://ryoppippi.com/blog/2026-08-15-uk-gtv-en/',
			},
			datePublished: gtvPost.pubDate,
			inLanguage: 'en',
		});
	});

	it('uses the first prose paragraph when description frontmatter is absent', () => {
		const [article] = articlePages(
			{
				...gtvPost,
				description: undefined,
				content: '# Heading\n\nA useful fallback paragraph with [a link](https://example.com).',
			},
			assets,
		);

		expect(article?.content).toContain(
			'<meta data-page-head="" name="description" content="A useful fallback paragraph with a link."/>',
		);
	});

	it('escapes less-than characters in JSON-LD text', () => {
		const [article] = articlePages(
			{
				...gtvPost,
				title: '</script><script>alert(1)</script>',
				description: 'A </script> description',
			},
			assets,
		);
		const jsonLd =
			article?.content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ??
			'';

		expect(jsonLd).toContain('\\u003c/script>');
		expect(jsonLd).not.toContain('</script><script>');
		expect(JSON.parse(jsonLd)).toMatchObject({
			headline: '</script><script>alert(1)</script>',
			description: 'A </script> description',
		});
	});
});

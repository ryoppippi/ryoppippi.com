import type { HeadInput } from '@ox-content/vite-plugin';
import { renderHead } from '@ox-content/vite-plugin';
import { SITE_NAME, SITE_ORIGIN, SITE_SOCIAL_IMAGE_URL } from '@/config/site.ts';

/** JSON-LD object emitted in a page head. */
export type StructuredData = Readonly<Record<string, unknown>>;

const fixedHead = [
	'<meta charset="utf-8">',
	'<meta name="viewport" content="width=device-width, initial-scale=1">',
	'<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">',
	'<meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)">',
	'<link rel="author" href="https://www.hatena.ne.jp/ryoppippi-2/">',
	'<link rel="icon" type="image/x-icon" href="/favicons/favicon.ico">',
	'<link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png">',
	'<link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png">',
	'<link rel="icon" type="image/png" sizes="48x48" href="/favicons/favicon-48x48.png">',
].join('\n');

function absolutePageUrl(pathname: string): string {
	return new URL(pathname, `${SITE_ORIGIN}/`).href;
}

/**
 * Renders page metadata with the Ox Content build-time head resolver.
 *
 * @param options - Page metadata used to generate the document head.
 * @returns The serialized head tags without a surrounding `<head>` element.
 */
export function renderPageHead({
	article = false,
	alternates,
	datePublished,
	description,
	indexable = true,
	lang,
	pathname,
	structuredData,
	title,
}: {
	article?: boolean;
	alternates?: Readonly<Record<string, string>>;
	datePublished?: string;
	description: string;
	indexable?: boolean;
	lang: string;
	pathname: string;
	structuredData?: StructuredData;
	title: string;
}): string {
	const canonical = indexable ? absolutePageUrl(pathname) : undefined;
	const documentTitle = title.length === 0 ? SITE_NAME : `${title} | ${SITE_NAME}`;
	const input = {
		site: { name: SITE_NAME, url: SITE_ORIGIN },
		title: documentTitle,
		titleSuffix: false,
		description,
		canonical,
		robots: indexable
			? 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'
			: 'noindex,follow',
		ogImage: indexable ? SITE_SOCIAL_IMAGE_URL : undefined,
		ogType: article ? 'article' : 'website',
		twitterCard: 'summary',
		social: indexable,
		emitSiteName: indexable,
		alternates:
			indexable && alternates != null
				? Object.entries({ ...alternates, [lang]: absolutePageUrl(pathname) }).map(
						([alternateLang, href]) => ({
							lang: alternateLang,
							href,
						}),
					)
				: [],
		metas: indexable
			? [
					{ name: 'Hatena::Bookmark', content: 'nocomment' },
					{ property: 'og:image:type', content: 'image/jpeg' },
					{ property: 'og:image:width', content: '400' },
					{ property: 'og:image:height', content: '400' },
					{ property: 'og:image:alt', content: "ryoppippi's icon" },
					...(article && datePublished != null
						? [{ property: 'article:published_time', content: datePublished }]
						: []),
					...(article ? [{ property: 'article:author', content: SITE_ORIGIN }] : []),
					{ name: 'twitter:site', content: '@ryoppippi' },
					{ name: 'twitter:image:alt', content: "ryoppippi's icon" },
				]
			: [],
		links: [
			{
				rel: 'alternate',
				type: 'application/rss+xml',
				href: '/feed.xml',
			},
		],
		jsonLd: structuredData == null ? [] : [{ key: 'page', json: JSON.stringify(structuredData) }],
		validation: 'strict',
	} satisfies HeadInput;
	const rendered = renderHead(input);
	const diagnostic = rendered.diagnostics.find(({ strict }) => strict);
	if (diagnostic != null) {
		throw new Error(`[ox-content] ${diagnostic.message}`);
	}

	return `${fixedHead}\n${rendered.html}`;
}

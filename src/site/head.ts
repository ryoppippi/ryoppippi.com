import type { BlogPosting, WithContext } from 'schema-dts';
import { ValidatePlugin } from 'unhead/plugins';
import { createHead } from 'unhead/server';
import { SITE_NAME, SITE_ORIGIN, SITE_SOCIAL_IMAGE_URL } from './consts.ts';

const pageHeadMarker = { 'data-page-head': '' } as const;

/**
 * Schema.org JSON-LD data emitted for blog articles.
 */
export type BlogPostingJsonLd = WithContext<BlogPosting>;

/**
 * Renders Unhead metadata into static HTML head tags.
 *
 * @param options - Page metadata used to generate the document head.
 * @returns The serialized head tags without a surrounding `<head>` element.
 */
export function renderPageHead({
	article = false,
	alternates,
	description,
	lang,
	pathname,
	structuredData,
	title,
}: {
	article?: boolean;
	alternates?: Readonly<Record<string, string>>;
	description: string;
	lang: string;
	pathname: string;
	structuredData?: BlogPostingJsonLd;
	title: string;
}): string {
	const fullTitle = title === 'home' ? SITE_NAME : `${title} | ${SITE_NAME}`;
	const url = `${SITE_ORIGIN}${pathname}`;
	const alternateLinks =
		alternates == null
			? []
			: Object.entries({ ...alternates, [lang]: url }).map(([alternateLang, alternateUrl]) => ({
					...pageHeadMarker,
					hreflang: alternateLang,
					href: alternateUrl,
					rel: 'alternate' as const,
				}));
	const head = createHead({
		init: [
			{
				meta: [
					{ charset: 'utf-8' },
					{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
					{ ...pageHeadMarker, name: 'description', content: description },
					{ name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
					{ name: 'theme-color', content: '#121212', media: '(prefers-color-scheme: dark)' },
					{
						...pageHeadMarker,
						name: 'robots',
						content: 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1',
					},
					{ ...pageHeadMarker, name: 'Hatena::Bookmark', content: 'nocomment' },
					{ ...pageHeadMarker, property: 'og:type', content: article ? 'article' : 'website' },
					{ ...pageHeadMarker, property: 'og:title', content: fullTitle },
					{ ...pageHeadMarker, property: 'og:description', content: description },
					{ ...pageHeadMarker, property: 'og:url', content: url },
					{ ...pageHeadMarker, property: 'og:image', content: SITE_SOCIAL_IMAGE_URL },
					{ ...pageHeadMarker, property: 'og:image:type', content: 'image/jpeg' },
					{ ...pageHeadMarker, property: 'og:image:width', content: '400' },
					{ ...pageHeadMarker, property: 'og:image:height', content: '400' },
					{ ...pageHeadMarker, property: 'og:image:alt', content: "ryoppippi's icon" },
					{ ...pageHeadMarker, name: 'twitter:card', content: 'summary' },
					{ ...pageHeadMarker, name: 'twitter:site', content: '@ryoppippi' },
					{ ...pageHeadMarker, name: 'twitter:title', content: fullTitle },
					{ ...pageHeadMarker, name: 'twitter:description', content: description },
					{ ...pageHeadMarker, name: 'twitter:image', content: SITE_SOCIAL_IMAGE_URL },
					{ ...pageHeadMarker, name: 'twitter:image:alt', content: "ryoppippi's icon" },
				],
				link: [
					{ ...pageHeadMarker, rel: 'canonical', href: url },
					...alternateLinks,
					{ rel: 'author', href: 'https://www.hatena.ne.jp/ryoppippi-2/' },
					{ rel: 'icon', type: 'image/x-icon', href: '/favicons/favicon.ico' },
					{ rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicons/favicon-16x16.png' },
					{ rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicons/favicon-32x32.png' },
					{ rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicons/favicon-48x48.png' },
					{
						rel: 'alternate',
						title: description,
						type: 'application/rss+xml',
						href: '/feed.xml',
					},
				],
				script:
					structuredData == null
						? []
						: [
								{
									...pageHeadMarker,
									type: 'application/ld+json',
									textContent: JSON.stringify(structuredData),
								},
							],
				title: fullTitle,
			},
		],
		plugins: [
			ValidatePlugin({
				rules: {
					'deprecated-twitter-meta': 'off',
					'html-in-title': 'off',
				},
			}),
		],
	});
	return head.render().headTags;
}

import type { ShowcaseProject } from '@ryoppippi/content';
import type { SiteAssets } from './assets.ts';
import type { PostListItem } from './content.ts';
import type { GeneratedFile } from './pages.ts';
import type { OssProject, Talk } from './sections.ts';
import { SITE_ORIGIN } from './consts.ts';
import { SITE_OWNER } from './site-owner.ts';
import { page, renderComponent } from './html.ts';
import About from './templates/About.svelte';
import ErrorPage from './templates/Error.svelte';
import Media from './templates/Media.svelte';
import Oss from './templates/Oss.svelte';
import Publications from './templates/Publications.svelte';
import Showcase from './templates/Showcase.svelte';
import Sponsors from './templates/Sponsors.svelte';
import Talks from './templates/Talks.svelte';

type Publication = { title: string; link: string; authors: string; publisher: string };

const ABOUT_PATHNAME = '/about/';
const ABOUT_TITLE = 'ryoppippi (Ryotaro Kimura)';
const ABOUT_DESCRIPTION =
	'Ryotaro Kimura (木村亮太朗), known as ryoppippi, is a Rork Founding Engineer building coding agents and developer tools, and the maintainer of ccusage.';

/**
 * Renders the site owner's profile page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated About page.
 */
export function aboutPage(assets: SiteAssets): GeneratedFile {
	const url = `${SITE_ORIGIN}${ABOUT_PATHNAME}`;
	return {
		path: 'about/index.html',
		sourcePaths: ['src/site/site-owner.ts', 'src/site/templates/About.svelte'],
		content: page({
			title: ABOUT_TITLE,
			pathname: ABOUT_PATHNAME,
			content: renderComponent(About, {}),
			description: ABOUT_DESCRIPTION,
			assets,
			style: 'about',
			structuredData: {
				'@context': 'https://schema.org',
				'@type': 'ProfilePage',
				'@id': `${url}#profile`,
				url,
				name: ABOUT_TITLE,
				description: ABOUT_DESCRIPTION,
				mainEntity: {
					'@type': 'Person',
					'@id': SITE_OWNER.id,
					name: SITE_OWNER.name,
					description: ABOUT_DESCRIPTION,
					jobTitle: 'Founding Engineer',
					worksFor: {
						'@type': 'Organization',
						name: 'Rork',
						url: 'https://rork.com/',
					},
					alternateName: [
						SITE_OWNER.japaneseName,
						SITE_OWNER.formerName,
						SITE_OWNER.formerJapaneseName,
						SITE_OWNER.handle,
					],
					url: SITE_OWNER.url,
					image: `${SITE_ORIGIN}/ryoppippi.avif`,
					sameAs: [...SITE_OWNER.sameAs],
				},
			},
		}),
	};
}

/**
 * Renders the open-source projects page.
 *
 * @param projects - Manually ordered OSS projects to render.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated open-source projects page.
 */
export function ossPage(projects: OssProject[], assets: SiteAssets): GeneratedFile {
	return {
		path: 'works/oss/index.html',
		sourcePaths: [
			'src/site/sections.ts',
			'src/site/templates/Oss.svelte',
			'src/contents/works/oss/list.json',
		],
		content: page({
			title: 'Open-source projects',
			pathname: '/works/oss/',
			content: renderComponent(Oss, { projects }),
			description:
				'Open-source projects by @ryoppippi across AI tools, Nix, TypeScript, Svelte, Vim, Zig, and shell configuration.',
			assets,
			style: 'works',
		}),
	};
}

/**
 * Renders the project showcase page.
 *
 * @param projects - Showcase projects to render.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated project showcase page.
 */
export function showcasePage(projects: ShowcaseProject[], assets: SiteAssets): GeneratedFile {
	return {
		path: 'works/showcase/index.html',
		sourcePaths: [
			'src/site/templates/Showcase.svelte',
			'packages/content/src/showcase.ts',
			'packages/content/src/showcase',
		],
		content: page({
			title: 'Project showcase',
			pathname: '/works/showcase/',
			content: renderComponent(Showcase, { projects }),
			description:
				'Selected projects and experiments by @ryoppippi, with demos, source links, and implementation notes.',
			assets,
			style: 'works',
		}),
	};
}

/**
 * Renders the publications page.
 *
 * @param publications - Publications grouped by their year or category.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated publications page.
 */
export function publicationsPage(
	publications: Record<string, Publication[]>,
	assets: SiteAssets,
): GeneratedFile {
	return {
		path: 'works/publications/index.html',
		sourcePaths: [
			'src/site/sections.ts',
			'src/site/templates/Publications.svelte',
			'src/contents/publication.json',
		],
		content: page({
			title: 'Publications',
			pathname: '/works/publications/',
			content: renderComponent(Publications, { publications }),
			description:
				'Research papers and technical publications authored or co-authored by @ryoppippi.',
			assets,
			style: 'works',
		}),
	};
}

/**
 * Renders the talks page.
 *
 * @param talks - Talks loaded from the talks data source.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated talks page.
 */
export function talksPage(talks: Talk[], assets: SiteAssets): GeneratedFile {
	return {
		path: 'works/talks/index.html',
		sourcePaths: ['src/site/sections.ts', 'src/site/templates/Talks.svelte'],
		content: page({
			title: 'Talks',
			pathname: '/works/talks/',
			content: renderComponent(Talks, { talks }),
			description:
				'Conference talks and presentations by @ryoppippi, with event links, slides, and videos.',
			assets,
			style: 'works',
		}),
	};
}

/**
 * Renders the podcasts and videos page.
 *
 * @param items - Curated external media to render.
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated media page.
 */
export function mediaPage(items: PostListItem[], assets: SiteAssets): GeneratedFile {
	const sorted = items.toSorted((a, b) => b.pubDate.localeCompare(a.pubDate));
	return {
		path: 'works/media/index.html',
		sourcePaths: [
			'src/site/content.ts',
			'src/site/templates/Media.svelte',
			'src/contents/external-rss/media.json',
		],
		content: page({
			title: 'Media',
			pathname: '/works/media/',
			content: renderComponent(Media, { items: sorted }),
			description: 'Podcasts, interviews, and videos featuring @ryoppippi.',
			assets,
			style: 'works',
		}),
	};
}

/**
 * Renders the sponsors page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated sponsors page.
 */
export function sponsorsPage(assets: SiteAssets): GeneratedFile {
	return {
		path: 'sponsors/index.html',
		sourcePaths: ['src/site/templates/Sponsors.svelte'],
		content: page({
			title: 'Sponsors',
			pathname: '/sponsors/',
			content: renderComponent(Sponsors, {}),
			description:
				"Support @ryoppippi's open-source projects, technical writing, and talks through GitHub Sponsors.",
			assets,
			style: 'sponsors',
		}),
	};
}

/**
 * Renders the non-indexable error page.
 *
 * @param assets - Bundled site assets referenced by the page.
 * @returns The generated error page.
 */
export function errorPage(assets: SiteAssets): GeneratedFile {
	return {
		path: '404.html',
		sourcePaths: ['src/site/secondary-pages.ts', 'src/site/templates/Error.svelte'],
		content: page({
			title: 'Page not found',
			pathname: '/404',
			content: renderComponent(ErrorPage, {}),
			description: 'The requested page could not be found.',
			indexable: false,
			assets,
			style: 'error',
		}),
	};
}

if (import.meta.vitest != null) {
	const assets = {
		base: '',
		client: '',
		islands: {},
		pages: { about: '', article: '', blog: '', error: '', home: '', sponsors: '', works: '' },
		tweet: '',
	} as const satisfies SiteAssets;

	test('keeps the generated 404 page out of search and social metadata', () => {
		const html = errorPage(assets).content;
		expect(html).toContain('<meta data-page-head="" name="robots" content="noindex,follow">');
		expect(html).not.toContain('property="og:');
		expect(html).not.toContain('rel="canonical"');
	});

	test('renders the About page with profile content and view transitions', () => {
		const html = aboutPage(assets).content;
		const structuredDataSource = html.match(
			/<script data-page-head="" type="application\/ld\+json">(?<json>.*?)<\/script>/u,
		)?.groups?.json;

		expect(html).toContain('<title>ryoppippi (Ryotaro Kimura) | ryoppippi.com</title>');
		expect(html).toContain(
			'<meta data-page-head="" name="description" content="Ryotaro Kimura (木村亮太朗), known as ryoppippi, is a Rork Founding Engineer building coding agents and developer tools, and the maintainer of ccusage.">',
		);
		expect(html).toContain(
			'<meta data-page-head="" name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">',
		);
		expect(html).toContain(
			'<link data-page-head="" rel="canonical" href="https://ryoppippi.com/about/">',
		);
		expect(html).toContain(
			'<meta data-page-head="" property="og:title" content="ryoppippi (Ryotaro Kimura) | ryoppippi.com">',
		);
		expect(html).toContain(
			`<meta data-page-head="" property="og:description" content="${ABOUT_DESCRIPTION}">`,
		);
		expect(html).toContain(
			'<meta data-page-head="" property="og:url" content="https://ryoppippi.com/about/">',
		);
		expect(html).toContain(
			'<meta data-page-head="" property="og:image" content="https://ryoppippi.com/ryoppippi.jpg">',
		);
		expect(html).toContain(
			'<meta data-page-head="" name="twitter:title" content="ryoppippi (Ryotaro Kimura) | ryoppippi.com">',
		);
		expect(html).toContain(
			`<meta data-page-head="" name="twitter:description" content="${ABOUT_DESCRIPTION}">`,
		);
		expect(html).toContain(
			'<meta data-page-head="" name="twitter:image" content="https://ryoppippi.com/ryoppippi.jpg">',
		);
		expect(html).toContain('src="/ryoppippi.avif"');
		expect(html).toContain('src="/haichu.avif"');
		expect(html).toContain('Ryotaro Kimura');
		expect(html).toContain('木村亮太朗');
		expect(html).toContain('coder without ai');
		expect(html).toContain('Founding Engineer');
		expect(html).toContain(
			'building coding agents, developer tools, and human-centred AI products',
		);
		expect(html).toContain('href="https://rork.com/"');
		expect(html).toContain('href="/works/oss/"');
		expect(html).toContain('href="/cv"');
		expect(html).toContain('<ul');
		expect(html).toContain('>GitHub</a>');
		expect(html).not.toContain('>PR</a>');
		expect(html).not.toContain('<figcaption');
		expect(html).toContain('view-transition-name:about-haichu');
		expect(structuredDataSource).toBeDefined();
		expect(JSON.parse(structuredDataSource ?? '')).toMatchObject({
			'@type': 'ProfilePage',
			name: ABOUT_TITLE,
			description: ABOUT_DESCRIPTION,
			mainEntity: {
				'@type': 'Person',
				name: SITE_OWNER.name,
				description: ABOUT_DESCRIPTION,
				jobTitle: 'Founding Engineer',
				worksFor: {
					'@type': 'Organization',
					name: 'Rork',
					url: 'https://rork.com/',
				},
			},
		});
	});
}

import type { ShowcaseProject } from '@ryoppippi/content';
import type { SiteAssets } from './assets.ts';
import type { PostListItem } from './content.ts';
import type { GeneratedFile } from './pages.ts';
import type { OssProject, Talk } from './sections.ts';
import { page, renderComponent } from './html.ts';
import ErrorPage from './templates/Error.svelte';
import Media from './templates/Media.svelte';
import Oss from './templates/Oss.svelte';
import Publications from './templates/Publications.svelte';
import Showcase from './templates/Showcase.svelte';
import Sponsors from './templates/Sponsors.svelte';
import Talks from './templates/Talks.svelte';

type Publication = { title: string; link: string; authors: string; publisher: string };

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
		pages: { article: '', blog: '', error: '', home: '', sponsors: '', works: '' },
	} as const satisfies SiteAssets;

	test('keeps the generated 404 page out of search and social metadata', () => {
		const html = errorPage(assets).content;
		expect(html).toContain('<meta data-page-head="" name="robots" content="noindex,follow">');
		expect(html).not.toContain('property="og:');
		expect(html).not.toContain('rel="canonical"');
	});
}

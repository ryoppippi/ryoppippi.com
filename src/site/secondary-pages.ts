import type { ShowcaseProject } from '@ryoppippi/content';
import type { SiteAssets } from './assets.ts';
import type { GeneratedFile } from './pages.ts';
import type { OssProject, Talk } from './sections.ts';
import { page, renderComponent } from './html.ts';
import ErrorPage from './templates/Error.svelte';
import Oss from './templates/Oss.svelte';
import Publications from './templates/Publications.svelte';
import Showcase from './templates/Showcase.svelte';
import Sponsors from './templates/Sponsors.svelte';
import Talks from './templates/Talks.svelte';

type Publication = { title: string; link: string; authors: string; publisher: string };

export function ossPage(projects: Record<string, OssProject[]>, assets: SiteAssets): GeneratedFile {
	return {
		path: 'works/oss/index.html',
		sourcePaths: [
			'src/site/sections.ts',
			'src/site/secondary-pages.ts',
			'src/site/templates/Oss.svelte',
			'src/contents/works/oss/list.json',
		],
		content: page({
			title: 'Open-source projects',
			pathname: '/works/oss/',
			content: renderComponent(Oss, { projects }),
			description:
				'Open-source projects by @ryoppippi across developer tooling, TypeScript, Svelte, CLI, Vim, Zig, and Nix.',
			assets,
			style: 'works',
		}),
	};
}

export function showcasePage(projects: ShowcaseProject[], assets: SiteAssets): GeneratedFile {
	return {
		path: 'works/showcase/index.html',
		sourcePaths: [
			'src/site/secondary-pages.ts',
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

export function publicationsPage(
	publications: Record<string, Publication[]>,
	assets: SiteAssets,
): GeneratedFile {
	return {
		path: 'works/publications/index.html',
		sourcePaths: [
			'src/site/sections.ts',
			'src/site/secondary-pages.ts',
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

export function talksPage(talks: Talk[], assets: SiteAssets): GeneratedFile {
	return {
		path: 'works/talks/index.html',
		sourcePaths: [
			'src/site/sections.ts',
			'src/site/secondary-pages.ts',
			'src/site/templates/Talks.svelte',
		],
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

export function sponsorsPage(assets: SiteAssets): GeneratedFile {
	return {
		path: 'sponsors/index.html',
		sourcePaths: ['src/site/secondary-pages.ts', 'src/site/templates/Sponsors.svelte'],
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
		tweet: '',
	} as const satisfies SiteAssets;

	test('keeps the generated 404 page out of search and social metadata', () => {
		const html = errorPage(assets).content;
		expect(html).toContain('<meta data-page-head="" name="robots" content="noindex,follow">');
		expect(html).not.toContain('property="og:');
		expect(html).not.toContain('rel="canonical"');
	});
}

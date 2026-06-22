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
		content: page({
			title: 'oss',
			pathname: '/works/oss/',
			content: renderComponent(Oss, { projects }),
			assets,
			style: 'works',
		}),
	};
}

export function showcasePage(projects: ShowcaseProject[], assets: SiteAssets): GeneratedFile {
	return {
		path: 'works/showcase/index.html',
		content: page({
			title: 'showcase',
			pathname: '/works/showcase/',
			content: renderComponent(Showcase, { projects }),
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
		content: page({
			title: 'publications',
			pathname: '/works/publications/',
			content: renderComponent(Publications, { publications }),
			assets,
			style: 'works',
		}),
	};
}

export function talksPage(talks: Talk[], assets: SiteAssets): GeneratedFile {
	return {
		path: 'works/talks/index.html',
		content: page({
			title: 'talks',
			pathname: '/works/talks/',
			content: renderComponent(Talks, { talks }),
			assets,
			style: 'works',
		}),
	};
}

export function sponsorsPage(assets: SiteAssets): GeneratedFile {
	return {
		path: 'sponsors/index.html',
		content: page({
			title: 'sponsors',
			pathname: '/sponsors/',
			content: renderComponent(Sponsors, {}),
			assets,
			style: 'sponsors',
		}),
	};
}

export function errorPage(assets: SiteAssets): GeneratedFile {
	return {
		path: '404.html',
		content: page({
			title: 'Not found',
			pathname: '/404',
			content: renderComponent(ErrorPage, {}),
			assets,
			style: 'error',
		}),
	};
}

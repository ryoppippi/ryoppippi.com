import type { GeneratedFile } from './pages.ts';
import type { OssProject, ShowcaseProject, Talk } from './sections.ts';
import { formatDate } from '../lib/util.ts';
import { escapeHtml, externalAttributes, largeTitle, page } from './html.ts';

type Publication = { title: string; link: string; authors: string; publisher: string };

function worksNav(active: string): string {
	return `<div class="text-center font-mono">
		<h1 class="pb-4 text-5xl font-bold opacity-70">Projects</h1>
		<p class="mb-5 text-lg italic opacity-50"><span class="text-nowrap">... that</span> <span class="text-nowrap">I</span> <span class="text-nowrap">(&rsquo;m working | &rsquo;ve worked)</span> <span class="text-nowrap">on</span></p>
		<nav class="fcol-sm-row fw mb-8 gap-1 text-3xl sm:gap-3" aria-label="Works sections">
			${['oss', 'showcase', 'talks', 'publications'].map(item => `<a class="opacity-20${item === active ? ' opacity-70' : ''}"${item === active ? ' aria-current="page"' : ''} href="/works/${item}/">${item === 'oss' ? 'Oss' : item[0].toUpperCase() + item.slice(1)}</a>`).join('')}
		</nav>
	</div>`;
}

function projectCard(project: { name: string; description: string | null; icon: string; link: string }): string {
	return `<a class="grid grid-cols-5 max-w-full select-none font-sans no-underline op-card transition-base hover:scale-[1.01] hover:shadow-xl" href="${project.link}" rel="noopener noreferrer" target="_blank">
		<div class="gcc"><span class="${project.icon} text-3xl opacity-50" aria-hidden="true"></span></div>
		<div class="fcol col-span-4"><div class="truncate text-lg">${escapeHtml(project.name)}</div><p class="h-8 line-clamp-2 text-xs">${escapeHtml(project.description ?? '')}</p></div>
	</a>`;
}

export function ossPage(projects: Record<string, OssProject[]>, assets: string): GeneratedFile {
	const groups = Object.entries(projects).map(([genre, items]) => `<section>${largeTitle(genre, 2)}<div class="grid grid-cols-1 gap-8 md:grid-cols-2">${items.map(projectCard).join('')}</div></section>`).join('');
	const links = `<div class="prose mx-auto mt-10 pb-5 dark:prose-invert"><div class="fxc gap-2"><a class="btn-green fcol-md-row fyc gap-1" href="https://ryoppippi.com/pr" rel="noopener noreferrer" target="_blank"><span class="icon-[ph--git-pull-request-duotone]" aria-hidden="true"></span>My Recent PRs</a><a class="btn-blue fcol-md-row fyc gap-1" href="https://ryoppippi.com/gh" rel="noopener noreferrer" target="_blank"><span class="icon-[ph--github-logo-duotone]" aria-hidden="true"></span>GitHub</a><a class="btn-pink fcol-md-row fyc gap-1" href="https://ryoppippi.com/gh-by-stars" rel="noopener noreferrer" target="_blank"><span class="icon-[ph--star]" aria-hidden="true"></span>Sort by Stars</a></div></div>`;
	return { path: 'works/oss/index.html', content: page({ title: 'oss', pathname: '/works/oss/', content: `${worksNav('oss')}${links}<div class="grid gap-16">${groups}</div>`, assets }) };
}

export function showcasePage(projects: ShowcaseProject[], assets: string): GeneratedFile {
	const cards = projects.map(project => `<article class="group overflow-hidden rounded-lg border border-base transition-base hover:scale-[1.01] hover:shadow-xl">
		<a href="${project.link}"${externalAttributes(project.link)}>${project.image == null ? '' : `<img class="aspect-video w-full border-b border-base object-cover" alt="${escapeHtml(project.title)}" src="${project.image}">`}</a>
		<div class="p-4 op-card"><h2 class="text-2xl"><a href="${project.link}"${externalAttributes(project.link)}>${escapeHtml(project.title)}</a></h2><div class="prose dark:prose-invert">${project.html}</div><p class="pt-2 text-sm opacity-50">${formatDate(new Date(project.pubDate))}</p></div>
	</article>`).join('');
	return { path: 'works/showcase/index.html', content: page({ title: 'showcase', pathname: '/works/showcase/', content: `${worksNav('showcase')}<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">${cards}</div>`, assets }) };
}

export function publicationsPage(publications: Record<string, Publication[]>, assets: string): GeneratedFile {
	const groups = Object.entries(publications).sort(([a], [b]) => Number(b) - Number(a)).map(([year, items]) => `<section>${largeTitle(year, 2)}<ul class="mx-auto px-10">${items.map(item => `<li class="my-5"><a class="text-xl underline" href="${item.link}" rel="noopener noreferrer" target="_blank">${escapeHtml(item.title)}</a><p class="opacity-50">${escapeHtml(item.publisher)}</p></li>`).join('')}</ul></section>`).join('');
	return { path: 'works/publications/index.html', content: page({ title: 'publications', pathname: '/works/publications/', content: `${worksNav('publications')}${groups}`, assets }) };
}

export function talksPage(talks: Talk[], assets: string): GeneratedFile {
	const today = Date.now();
	const byYear = Map.groupBy(talks, talk => new Date(talk.date).getFullYear());
	const groups = [...byYear.entries()].sort(([a], [b]) => b - a).map(([year, items]) => `<section>${largeTitle(String(year), 2)}<ul class="mx-auto px-10">${items.map((talk) => {
		const happened = new Date(talk.date).getTime() < today;
		const link = happened ? talk.links[0] : undefined;
		const title = link == null ? escapeHtml(talk.title) : `<a class="underline" href="${link}" rel="noopener noreferrer" target="_blank">${escapeHtml(talk.title)}</a>`;
		return `<li class="my-5" data-lang="${talk.lang ?? 'en'}"><h3 class="text-xl">${title}</h3><p class="opacity-50">${talk.eventLink == null ? escapeHtml(talk.event) : `<a href="${talk.eventLink}" rel="noopener noreferrer" target="_blank">${escapeHtml(talk.event)}</a>`} <small>${formatDate(new Date(talk.date))}</small></p>${happened && talk.videoLink != null ? `<a class="text-sm opacity-50" href="${talk.videoLink}">Watch the video</a>` : ''}</li>`;
	}).join('')}</ul></section>`).join('');
	return { path: 'works/talks/index.html', content: page({ title: 'talks', pathname: '/works/talks/', content: `${worksNav('talks')}${groups}`, assets }) };
}

export function sponsorsPage(assets: string): GeneratedFile {
	const content = `<div class="fcol container mx-auto gap-8 py-8"><h1 class="sr-only">Sponsors</h1><p class="op-card">Thank you to everyone supporting my work—it keeps the OSS, blog, and talks alive.</p><p><a class="inline-flex items-center gap-2 btn-pink" href="https://github.com/sponsors/ryoppippi" rel="noreferrer" target="_blank"><span class="icon-[ph--heart]" aria-hidden="true"></span>GitHub Sponsors</a></p><div class="fcol-sm-row fw gap-3 text-2xl"><button class="opacity-70" data-sponsor-view="circles" type="button">Sponsor Circles</button><button class="opacity-20" data-sponsor-view="tiers" type="button">Sponsor Tiers</button></div><img class="mx-auto h-auto w-full max-w-5xl" alt="GitHub Sponsors" data-sponsor-image src="https://sponsors.ryoppippi.com/sponsors.circles.svg"></div>`;
	return { path: 'sponsors/index.html', content: page({ title: 'sponsors', pathname: '/sponsors/', content, assets }) };
}

export function errorPage(assets: string): GeneratedFile {
	const content = `<div class="fcol fxc min-h-[50vh] text-center"><h1 class="text-6xl font-bold">404</h1><p class="mt-4 opacity-60">Page not found</p><a class="mt-8 underline" href="/">Back home</a></div>`;
	return { path: '404.html', content: page({ title: 'Not found', pathname: '/404', content, assets }) };
}

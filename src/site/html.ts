const ORIGIN = 'https://ryoppippi.com';

export function escapeHtml(value: unknown): string {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll('\'', '&#39;');
}

function navLink(pathname: string, href: string, label: string): string {
	const active = pathname.startsWith(href);
	return `<a class="relative block shrink-0 whitespace-nowrap" href="${href}">
		<span>${label}</span>
		<span class="absolute left-0 top-full h-0.5 w-full ${active ? 'bg-accent-100' : 'bg-transparent'}"></span>
	</a>`;
}

function navigation(pathname: string): string {
	const isHome = pathname === '/';
	return `<header class="mx-auto grid items-center gap-y-6 py-6 text-xl opacity-70 transition-base hover:opacity-100 max-md:grid-cols-1 md:grid-cols-3">
		<div class="${isHome ? 'max-md:hidden md:flex' : 'flex'}">
			${isHome ? '' : '<a class="relative font-bold max-md:mx-auto md:mx-0" aria-label="Home" href="/"><span style="view-transition-name:title-ryoppippi">@ryoppippi</span></a>'}
		</div>
		<nav class="flex w-full max-w-full flex-wrap gap-x-4 gap-y-4 text-lg font-bold max-md:mx-auto max-md:justify-center md:col-span-2 md:ml-auto md:mr-0 md:justify-end" aria-label="Primary navigation">
			${navLink(pathname, '/works/', 'works')}
			${navLink(pathname, '/blog/', 'blog')}
			${navLink(pathname, '/sponsors/', 'sponsors')}
			<a class="relative block w-10 shrink-0 whitespace-nowrap px-0" href="/cv" rel="noopener noreferrer" target="_blank"><span class="fyc">cv <span class="icon-[line-md--download-outline] size-[1em] shrink-0" aria-hidden="true"></span></span></a>
			<div class="flex w-[4.375rem] justify-between [&_button]:my-auto [&_button]:flex [&_button]:cursor-pointer [&_button]:items-center [&_button]:border-0 [&_button]:bg-transparent [&_button]:p-0 [&_button]:text-inherit">
				<span class="flex items-center" data-dark-mode></span>
				<a class="fyc my-auto" aria-label="RSS feed" href="/feed.xml"><span class="icon-[line-md--rss]" aria-hidden="true"></span><span class="sr-only">RSS feed</span></a>
				<a class="fyc my-auto" aria-label="Source code on GitHub" href="https://github.com/ryoppippi/ryoppippi.com" rel="noopener noreferrer" target="_blank"><span class="icon-[teenyicons--github-solid]" aria-hidden="true"></span><span class="sr-only">Source code</span></a>
			</div>
		</nav>
	</header>`;
}

type PageOptions = {
	title: string;
	pathname: string;
	content: string;
	description?: string;
	article?: boolean;
	assets: string;
};

export function page({ title, pathname, content, description = 'Portfolio of @ryoppippi', article = false, assets }: PageOptions): string {
	const fullTitle = title === 'home' ? 'ryoppippi.com' : `${title} | ryoppippi.com`;
	const url = `${ORIGIN}${pathname}`;
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="description" content="${escapeHtml(description)}">
	<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
	<meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)">
	<meta property="og:type" content="${article ? 'article' : 'website'}">
	<meta property="og:title" content="${escapeHtml(fullTitle)}">
	<meta property="og:description" content="${escapeHtml(description)}">
	<meta property="og:url" content="${url}">
	<meta property="og:image" content="${ORIGIN}/ryoppippi.jpg">
	<meta name="twitter:card" content="summary">
	<meta name="twitter:site" content="@ryoppippi">
	<script>if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');</script>
	<title>${escapeHtml(fullTitle)}</title>
	<link rel="icon" href="/ryoppippi.jpg">
	<link rel="alternate" title="${escapeHtml(description)}" type="application/rss+xml" href="/feed.xml">
	${assets}
</head>
<body>
	<a class="skip-link" href="#main-content">Skip to content</a>
	<div class="mx-auto my-3 max-w-4xl px-8">
		${navigation(pathname)}
		<main id="main-content" tabindex="-1">${content}</main>
	</div>
</body>
</html>`;
}

export function largeTitle(title: string, level: 1 | 2 = 1, opacity = true): string {
	return `<h${level} class="f-text-32-64 my-8 font-mono font-bold leading-none text-stroke-aaa text-transparent ${opacity ? 'opacity-35 dark:opacity-20' : ''}">${escapeHtml(title)}</h${level}>`;
}

export function externalAttributes(href: string): string {
	return href.startsWith('http') ? ' rel="noopener noreferrer" target="_blank"' : '';
}

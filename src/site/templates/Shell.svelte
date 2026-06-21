<script lang='ts'>
	import { createRawSnippet } from 'svelte';

	let {
		article = false,
		content,
		description,
		pathname,
		title,
	}: {
		article?: boolean;
		content: string;
		description: string;
		pathname: string;
		title: string;
	} = $props();

	const origin = 'https://ryoppippi.com';
	const fullTitle = $derived(title === 'home' ? 'ryoppippi.com' : `${title} | ryoppippi.com`);
	const url = $derived(`${origin}${pathname}`);
	const pageContent = $derived(createRawSnippet(() => ({ render: () => content })));
	const isHome = $derived(pathname === '/');
	const links = [
		{ href: '/works/oss/', label: 'works', activePrefix: '/works/' },
		{ href: '/blog/', label: 'blog' },
		{ href: '/sponsors/', label: 'sponsors' },
	] as const;
</script>

<svelte:head>
	<meta charset='utf-8' />
	<meta name='viewport' content='width=device-width, initial-scale=1' />
	<meta data-page-head name='description' content={description} />
	<meta name='theme-color' content='#ffffff' media='(prefers-color-scheme: light)' />
	<meta name='theme-color' content='#121212' media='(prefers-color-scheme: dark)' />
	<meta data-page-head name='robots' content='index,follow,nosnippet,max-snippet:-1,max-image-preview:none,noarchive,noimageindex,max-video-preview:-1,notranslate' />
	<meta data-page-head name='Hatena::Bookmark' content='nocomment' />
	<meta data-page-head property='og:type' content={article ? 'article' : 'website'} />
	<meta data-page-head property='og:title' content={fullTitle} />
	<meta data-page-head property='og:description' content={description} />
	<meta data-page-head property='og:url' content={url} />
	<meta data-page-head property='og:image' content={`${origin}/ryoppippi.jpg`} />
	<meta data-page-head property='og:image:alt' content="ryoppippi's icon" />
	<meta data-page-head name='twitter:card' content='summary' />
	<meta data-page-head name='twitter:site' content='@ryoppippi' />
	<meta data-page-head name='twitter:title' content={fullTitle} />
	<meta data-page-head name='twitter:description' content={description} />
	<meta data-page-head name='twitter:image' content={`${origin}/ryoppippi.jpg`} />
	<meta data-page-head name='twitter:image:alt' content="ryoppippi's icon" />
	<title>{fullTitle}</title>
	<link rel='icon' type='image/x-icon' href='/favicons/favicon.ico' />
	<link rel='icon' type='image/png' sizes='16x16' href='/favicons/favicon-16x16.png' />
	<link rel='icon' type='image/png' sizes='32x32' href='/favicons/favicon-32x32.png' />
	<link rel='icon' type='image/png' sizes='48x48' href='/favicons/favicon-48x48.png' />
	<link rel='alternate' title={description} type='application/rss+xml' href='/feed.xml' />
</svelte:head>

<a class='skip-link' href='#main-content'>Skip to content</a>
<div class='mx-auto my-3 max-w-4xl px-8'>
	<header class='mx-auto grid items-center gap-y-6 py-6 text-xl opacity-70 transition-base hover:opacity-100 max-md:grid-cols-1 md:grid-cols-3'>
		<div class={isHome ? 'max-md:hidden md:flex' : 'flex'}>
			{#if !isHome}
				<a class='relative font-bold max-md:mx-auto md:mx-0' aria-label='Home' href='/'>
					<span style='view-transition-name:title-ryoppippi'>@ryoppippi</span>
				</a>
			{/if}
		</div>
		<nav class='flex w-full max-w-full flex-wrap gap-x-4 gap-y-4 text-lg font-bold max-md:mx-auto max-md:justify-center md:col-span-2 md:ml-auto md:mr-0 md:justify-end' aria-label='Primary navigation'>
			{#each links as link (link.href)}
				{@const active = pathname.startsWith('activePrefix' in link ? link.activePrefix : link.href)}
				<a class='relative block shrink-0 whitespace-nowrap' href={link.href}>
					<span>{link.label}</span>
					<span class={`absolute left-0 top-full h-0.5 w-full ${active ? 'bg-accent-100' : 'bg-transparent'}`}></span>
				</a>
			{/each}
			<a class='relative block w-10 shrink-0 whitespace-nowrap px-0' href='/cv' rel='noopener noreferrer' target='_blank'>
				<span class='fyc'>cv <span class='icon-[line-md--download-outline] size-[1em] shrink-0' aria-hidden='true'></span></span>
			</a>
			<div class='flex w-[4.375rem] justify-between [&_button]:my-auto [&_button]:flex [&_button]:cursor-pointer [&_button]:items-center [&_button]:border-0 [&_button]:bg-transparent [&_button]:p-0 [&_button]:text-inherit'>
				<span class='flex items-center' data-dark-mode></span>
				<a class='fyc my-auto' aria-label='RSS feed' href='/feed.xml'>
					<span class='icon-[line-md--rss]' aria-hidden='true'></span><span class='sr-only'>RSS feed</span>
				</a>
				<a class='fyc my-auto' aria-label='Source code on GitHub' href='https://github.com/ryoppippi/ryoppippi.com' rel='noopener noreferrer' target='_blank'>
					<span class='icon-[teenyicons--github-solid]' aria-hidden='true'></span><span class='sr-only'>Source code</span>
				</a>
			</div>
		</nav>
	</header>
	<main id='main-content' tabindex='-1'>{@render pageContent()}</main>
</div>

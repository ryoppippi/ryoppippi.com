<script lang='ts'>
	import { createRawSnippet } from 'svelte';

	let {
		content,
		pathname,
	}: {
		content: string;
		pathname: string;
	} = $props();

	const pageContent = $derived(createRawSnippet(() => ({ render: () => content })));
	const isHome = $derived(pathname === '/');
	const links = [
		{ href: '/works/oss/', label: 'works', activePrefix: '/works/' },
		{ href: '/blog/', label: 'blog' },
		{ href: '/sponsors/', label: 'sponsors' },
	] as const;
</script>

<span data-nosnippet><a class='skip-link' href='#main-content'>Skip to content</a></span>
<div class='mx-auto my-3 max-w-4xl px-8'>
	<header class='mx-auto grid items-center gap-y-6 py-6 text-xl opacity-70 transition-base hover:opacity-100 max-md:grid-cols-1 md:grid-cols-3'>
		<div data-nosnippet class={isHome ? 'max-md:hidden md:flex' : 'flex'}>
			{#if !isHome}
				<a class='relative font-bold max-md:mx-auto md:mx-0' aria-label='Home' href='/'>
					<span style='view-transition-name:title-ryoppippi'>@ryoppippi</span>
				</a>
			{/if}
		</div>
		<nav class='flex w-full max-w-full flex-col gap-x-4 gap-y-4 text-lg font-bold max-md:mx-auto max-md:items-center md:col-span-2 md:ml-auto md:mr-0 md:flex-row md:flex-wrap md:justify-end' aria-label='Primary navigation'>
			<div data-nosnippet class='flex flex-wrap justify-center gap-x-4 gap-y-4'>
				{#each links as link (link.href)}
					{@const active = pathname.startsWith('activePrefix' in link ? link.activePrefix : link.href)}
					<a class='relative block shrink-0 whitespace-nowrap' href={link.href}>
						<span>{link.label}</span>
						<span class={`absolute left-0 top-full h-0.5 w-full ${active ? 'bg-accent-100' : 'bg-transparent'}`}></span>
					</a>
				{/each}
			</div>
			<div data-nosnippet class='flex flex-wrap items-center justify-center gap-x-4 gap-y-4'>
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
			</div>
		</nav>
	</header>
	<main id='main-content' tabindex='-1'>{@render pageContent()}</main>
</div>

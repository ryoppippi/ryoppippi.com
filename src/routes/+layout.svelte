<script>
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';

	import ryoppippi from '$lib/assets/ryoppippi.jpg';
	import { domain, subdomain } from '$lib/util';
	import { Header as DarkModeHeader } from 'svelte-fancy-darkmode';
	import { MetaTags } from 'svelte-meta-tags';

	import * as ufo from 'ufo';

	import faviconLinks from 'virtual:favicons';
	import 'uno.css';
	import '@unocss/reset/tailwind.css';

	const { children } = $props();

	onNavigate((navigation) => {
		if (!document?.startViewTransition) {
			return;
		}

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	const title = $derived(page.data.title ?? 'home');
	const description = `Portfolio of @ryoppippi`;
</script>

<DarkModeHeader themeColors={{ dark: '#121212', light: '#ffffff' }} />

<MetaTags
	additionalLinkTags={[
		{
			rel: 'alternate',
			title: description,
			type: 'application/rss+xml',
			href: '/feed.xml',
		},
	]}
	additionalMetaTags={[
		{
			name: 'Hatena::Bookmark',
			content: 'nocomment',
		},
	]}
	additionalRobotsProps={{
		noarchive: true,
		nosnippet: true,
		maxSnippet: -1,
		maxImagePreview: 'none',
		maxVideoPreview: -1,
		notranslate: true,
		noimageindex: true,
	}}
	{description}
	openGraph={{
		url: ufo.joinURL(subdomain(), page.url.pathname),
		type: 'website',
		title,
		description,
		images: [
			{
				url: ryoppippi,
				alt: 'ryoppippi\'s icon',
			},
		],
	}}
	{title}
	titleTemplate={title !== 'home' ? `%s | ${domain()}` : domain()}
	twitter={{
		cardType: 'summary',
		site: '@ryoppippi',
		title,
		description,
		image: ryoppippi,
		imageAlt: 'ryoppippi\'s icon',
	}} />
<svelte:head>
	{#each faviconLinks.split('\n') as link (link)}
		{#if !link.includes('theme-color')}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html link}
		{/if}
	{/each}
</svelte:head>

<main
	max-w-4xl
	mxa
	my3
	px-8
	un-dark
>
	<Nav />
	{#key page.url}
		{@render children()}
	{/key}
</main>

<style>
:global {
	body {
		--uno: font-sans text-base bg-white text-text-800 dark:(bg-bg-base text-text-100) motion-safe:(transition transition-duration-1s scroll-smooth);
	}
	@view-transition {
		navigation: auto;
	}
}
</style>

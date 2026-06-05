<script lang='ts'>
	import { onNavigate } from '$app/navigation';

	import { asset } from '$app/paths';
	import { page } from '$app/state';
	import Nav from '$components/Nav.svelte';

	import { PUBLIC_ORIGIN } from '$env/static/public';
	import { Header as DarkModeHeader } from 'svelte-fancy-darkmode';
	import { MetaTags } from 'svelte-meta-tags';
	import * as ufo from 'ufo';
	import faviconLinks from 'virtual:favicons';
	import '../styles/site.css';

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
	const hostname = ufo.parseURL(PUBLIC_ORIGIN).host ?? page.url.hostname;
	const ryoppippi = ufo.joinURL(PUBLIC_ORIGIN, asset('/ryoppippi.jpg'));
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
		url: ufo.joinURL(PUBLIC_ORIGIN, page.url.pathname),
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
	titleTemplate={title !== 'home'
		? `%s | ${hostname}`
		: hostname}
	twitter={{
		cardType: 'summary',
		site: '@ryoppippi',
		title,
		description,
		image: ryoppippi,
		imageAlt: 'ryoppippi\'s icon',
	}}
/>
<svelte:head>
	{#each faviconLinks.split('\n') as link (link)}
		{#if !link.includes('theme-color')}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html link}
		{/if}
	{/each}
</svelte:head>

<a class='skip-link' href='#main-content'>Skip to content</a>

<div class='mx-auto my-3 max-w-4xl px-8'>
	<Nav />
	<main id='main-content' tabindex='-1'>
		{#key page.url}
			{@render children()}
		{/key}
	</main>
</div>

<style>
	:global {
		@view-transition {
			navigation: auto;
		}
	}
</style>

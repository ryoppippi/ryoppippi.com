<script>
	import 'uno.css';
	import '@unocss/reset/tailwind.css';

	import faviconLinks from 'virtual:favicons';
	import { MetaTags } from 'svelte-meta-tags';
	import { page, updated } from '$app/stores';

	import { onNavigate } from '$app/navigation';

	import Nav from '$lib/Nav.svelte';
	import DarkMode from '$lib/DarkMode';
	import HeadTitle from '$lib/HeadTitle.svelte';

	import ryoppippi from '$lib/assets/ryoppippi.jpg';
	import { domain, subdomain } from '$lib/util';
	import { dev } from '$app/environment';

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

	$effect(() => {
		const url = $page.url;
		if (dev || url.hash.length > 1) {
			document.documentElement.classList.add('no-sliding');
		}
		else {
			document.documentElement.classList.remove('no-sliding');
		}
	});

</script>

<DarkMode />

<HeadTitle />
<MetaTags
	additionalRobotsProps={{
		noarchive: true,
		nosnippet: true,
		maxSnippet: -1,
		maxImagePreview: 'none',
		maxVideoPreview: -1,
		notranslate: true,
		noimageindex: true,
	}}
	openGraph={{
		url: subdomain(),
		type: 'website',
		description: 'Portfolio of @ryoppippi',
		images: [
			{
				url: ryoppippi,
				alt: 'ryoppippi\'s icon',
			},
		],
	}}
	twitter={{
		cardType: 'summary',
		site: '@ryoppippi',
		title: domain(),
		description: 'Portfolio of @ryoppippi',
		image: ryoppippi,
		imageAlt: 'ryoppippi\'s icon',
	}} />
<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html faviconLinks
		.split('\n')
		.filter(s => !s.includes('theme-color'))
		.join('\n')}
</svelte:head>

<main
	data-sveltekit-reload={$updated ? '' : 'off'}
	max-w-4xl
	mxa
	my3
	px-8
	un-dark
>
	<Nav />
	{#key $page.url}
		{@render children()}
	{/key}
</main>

<style>
:global {
	body {
		--at-apply: font-sans text-base bg-white text-text-800 dark:(bg-bg-base text-text-100) motion-safe:(transition transition-duration-1s scroll-smooth);
	}
	@view-transition {
		navigation: auto;
	}
}
</style>

<script>
	import 'uno.css';
	import '@unocss/reset/tailwind.css';

	import faviconLinks from 'virtual:favicons';
	import { MetaTags } from 'svelte-meta-tags';
	import { page, updated } from '$app/stores';

	import { onNavigate } from '$app/navigation';

	import Nav from '$lib/Nav.svelte';

	import ryoppippi from '$lib/assets/ryoppippi.png';

	const { children } = $props();

	onNavigate((navigation) => {
		// @ts-ignore
		if (!document?.startViewTransition) {
			return;
		}

		return new Promise((resolve) => {
			// @ts-ignore
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	const title = `ryoppippi.com`;
</script>

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
		url: 'https://ryoppippi.com',
		type: 'website',
		description: 'Portfolio of @ryoppippi',
		images: [
			{
				url: ryoppippi,
				alt: 'ryoppippi\'s icon',
			},
		],
	}}
	{title}
	twitter={{
		cardType: 'summary',
		site: '@ryoppippi',
		title,
		description: 'Portfolio of @ryoppippi',
		image: ryoppippi,
		imageAlt: 'ryoppippi\'s icon',
	}} />
<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html faviconLinks}
</svelte:head>

<main
	data-sveltekit-reload={$updated ? '' : 'off'}
	my-3
	un-dark
>
	<Nav />
	{#key $page.url}
		<article>
			{@render children()}
		</article>
	{/key}
</main>

<style>
:global {
	body {
		--at-apply: bg-bg-base scroll-smooth;
	}
}
</style>

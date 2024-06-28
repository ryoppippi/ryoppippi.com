<script>
	import '../app.postcss';

	import { MetaTags } from 'svelte-meta-tags';
	import { page, updated } from '$app/stores';

	import { onNavigate } from '$app/navigation';

	import Nav from '$lib/Nav.svelte';

	import faviconLinks from '$lib/assets/favicons.html?raw';
	import ryoppippi from '$lib/assets/ryoppippi.png';

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

	const title = `ryoppippi.com`;
</script>

<svelte:head>
	<!-- eslint-disable svelte/no-at-html-tags -->
	{@html faviconLinks}
</svelte:head>

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

<main class='dark my-3' data-sveltekit-reload={$updated ? '' : 'off'}>
	<Nav />
	{#key $page.url}
		<article>
			<slot />
		</article>
	{/key}
</main>

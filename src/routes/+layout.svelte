<script>
	import '../app.postcss';

	import { MetaTags } from 'svelte-meta-tags';
	import { page, updated } from '$app/stores';

	import { onNavigate } from '$app/navigation';

	import Nav from '$lib/Nav.svelte';

	import appleTouchIcon from '$lib/assets/favicons/apple-touch-icon.png';
	import favicon32 from '$lib/assets/favicons/favicon-32x32.png';
	import favicon16 from '$lib/assets/favicons/favicon-16x16.png';
	import siteWebmanifest from '$lib/assets/favicons/site.webmanifest';
	import ryoppippi from '$lib/assets/ryoppippi.png';

	onNavigate((navigation) => {
		if (!document?.startViewTransition)
			return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	const title = 'ryoppippi.com';
</script>

<MetaTags
	additionalLinkTags={[
		{
			rel: 'apple-touch-icon',
			href: appleTouchIcon,
			sizes: '180x180',
		},
		{
			rel: 'icon',
			type: 'image/png',
			href: favicon32,
			sizes: '32x32',
		},
		{
			rel: 'icon',
			type: 'image/png',
			href: favicon16,
			sizes: '16x16',
		},
		{
			rel: 'manifest',
			href: siteWebmanifest,
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

<main
	class='
		dark
		my-3
	' data-sveltekit-reload={$updated ? '' : 'off'}>
	<Nav />
	{#key $page.url}
		<article>
			<slot />
		</article>
	{/key}
</main>

<script>
	import '../theme.postcss';
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	import '../app.css';

	import { page } from '$app/stores';
	import { preparePageTransition } from '$lib/page-transition';

	import { MetaTags } from 'svelte-meta-tags';

	import Nav from '$lib/Nav.svelte';

	import appleTouchIcon from '$lib/assets/favicons/apple-touch-icon.png';
	import favicon32 from '$lib/assets/favicons/favicon-32x32.png';
	import favicon16 from '$lib/assets/favicons/favicon-16x16.png';
	import siteWebmanifest from '$lib/assets/favicons/site.webmanifest';
	import ryoppippi from '$lib/assets/ryoppippi.jpg';

	preparePageTransition();
</script>

<MetaTags
	title="ryoppippi.com"
	description="Portfolio of @ryoppippi"
	twitter={{
		handle: '@ryoppippi',
		site: '@ryoppippi',
		cardType: 'summary_large_image',
		title: 'ryoppippi.com',
		description: 'Portfolio of @ryoppippi',
		image: ryoppippi,
		imageAlt: "ryoppippi's icon"
	}}
	additionalLinkTags={[
		{
			rel: 'apple-touch-icon',
			sizes: '180x180',
			href: appleTouchIcon
		},
		{
			rel: 'icon',
			type: 'image/png',
			sizes: '32x32',
			href: favicon32
		},
		{
			rel: 'icon',
			type: 'image/png',
			sizes: '16x16',
			href: favicon16
		},
		{
			rel: 'manifest',
			href: siteWebmanifest
		}
	]}
	robotsProps={{
		noarchive: true,
		nosnippet: true,
		maxSnippet: -1,
		maxImagePreview: 'none',
		maxVideoPreview: -1,
		notranslate: true,
		noimageindex: true
	}} />

<main class="my-3 dark">
	<Nav />
	{#key $page.url}
		<article>
			<slot />
		</article>
	{/key}
</main>

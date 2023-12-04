<script>
	import '../app.postcss';

	import { page } from '$app/stores';

	import { MetaTags } from 'svelte-meta-tags';

	import { updated } from '$app/stores';

	import { onNavigate } from '$app/navigation';

	import Nav from '$lib/Nav.svelte';

	import appleTouchIcon from '$lib/assets/favicons/apple-touch-icon.png';
	import favicon32 from '$lib/assets/favicons/favicon-32x32.png';
	import favicon16 from '$lib/assets/favicons/favicon-16x16.png';
	import siteWebmanifest from '$lib/assets/favicons/site.webmanifest';
	import ryoppippi from '$lib/assets/ryoppippi.jpg';

	onNavigate((navigation) => {
		if (!document?.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<title>ryoppippi.com</title>
	<meta name="description" content="Portfolio of @ryoppippi" />

	<!-- favicon -->
	<link rel="apple-touch-icon" href={appleTouchIcon} sizes="180x180" />
	<link rel="icon" type="image/png" href={favicon32} sizes="32x32" />
	<link rel="icon" type="image/png" href={favicon16} sizes="16x16" />
	<link rel="manifest" href={siteWebmanifest} />

	<!-- og -->
	<meta property="og:url" content="https://ryoppippi.com" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="ryoppippi.com" />
	<meta property="og:site_name" content="ryoppippi.com" />
	<meta property="og:description" content="Portfolio of @ryoppippi" />
	<meta property="og:image" content={ryoppippi} />
	<meta property="og:image:alt" content="ryoppippi's icon" />

	<!-- twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:site" content="@ryoppippi" />
	<meta name="twitter:creator" content="@ryoppippi" />
	<meta name="twitter:title" content="ryoppippi.com" />
	<meta name="twitter:description" content="Portfolio of @ryoppippi" />
	<meta name="twitter:image" content={ryoppippi} />
	<meta name="twitter:image:alt" content="ryoppippi's icon" />
</svelte:head>

<MetaTags
	additionalRobotsProps={{
		noarchive: true,
		nosnippet: true,
		maxSnippet: -1,
		maxImagePreview: 'none',
		maxVideoPreview: -1,
		notranslate: true,
		noimageindex: true
	}} />

<main class="dark my-3" data-sveltekit-reload={$updated ? '' : 'off'}>
	<Nav />
	{#key $page.url}
		<article>
			<slot />
		</article>
	{/key}
</main>

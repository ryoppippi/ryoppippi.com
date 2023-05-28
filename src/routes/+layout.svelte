<script>
	import '../theme.postcss';
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	import '../app.css';

	import { page } from '$app/stores';
	import { preparePageTransition } from '$lib/page-transition';

	import { MetaTags } from 'svelte-meta-tags';

	import { updated } from '$app/stores';

	import Nav from '$lib/Nav.svelte';

	import appleTouchIcon from '$lib/assets/favicons/apple-touch-icon.png';
	import favicon32 from '$lib/assets/favicons/favicon-32x32.png';
	import favicon16 from '$lib/assets/favicons/favicon-16x16.png';
	import siteWebmanifest from '$lib/assets/favicons/site.webmanifest';
	import ryoppippi from '$lib/assets/ryoppippi.jpg';

	preparePageTransition();
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
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@ryoppippi" />
	<meta name="twitter:creator" content="@ryoppippi" />
	<meta name="twitter:title" content="ryoppippi.com" />
	<meta name="twitter:description" content="Portfolio of @ryoppippi" />
	<meta name="twitter:image" content={ryoppippi} />
	<meta name="twitter:image:alt" content="ryoppippi's icon" />
</svelte:head>

<MetaTags
	robotsProps={{
		noarchive: true,
		nosnippet: true,
		maxSnippet: -1,
		maxImagePreview: 'none',
		maxVideoPreview: -1,
		notranslate: true,
		noimageindex: true
	}} />

<main class="my-3 dark" data-sveltekit-reload={$updated ? '' : 'off'}>
	<Nav />
	{#key $page.url}
		<article>
			<slot />
		</article>
	{/key}
</main>

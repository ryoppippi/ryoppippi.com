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

	preparePageTransition();
</script>

<svelte:head>
	<link rel="apple-touch-icon" sizes="180x180" href={appleTouchIcon} />
	<link rel="icon" type="image/png" sizes="32x32" href={favicon32} />
	<link rel="icon" type="image/png" sizes="16x16" href={favicon16} />
	<link rel="manifest" href={siteWebmanifest} />
</svelte:head>
<MetaTags title="ryoppippi.com" description="Portfolio of ryoppippi" />

<main class="dark">
	<Nav />
	{#key $page.url}
		<article>
			<slot />
		</article>
	{/key}
</main>

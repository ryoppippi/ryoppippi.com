<script>
	import 'uno.css';
	import '@unocss/reset/tailwind.css';
	import NProgress from 'nprogress';

	import faviconLinks from 'virtual:favicons';
	import { MetaTags } from 'svelte-meta-tags';
	import { fromStore } from 'svelte/store';
	import { navigating, page, updated } from '$app/stores';

	import { onNavigate } from '$app/navigation';

	import DarkMode from '$lib/DarkMode';

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

	const pageRune = fromStore(page);
	const title = $derived(pageRune.current.data.title ?? 'home');

	$effect(() => {
		NProgress.configure({
			showSpinner: false,
		});
	});

	$effect(() => {
		if ($navigating) {
			NProgress.start();
		}
		else {
			NProgress.done();
		}
	});

</script>

<DarkMode />

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
	title={title}
	titleTemplate={title !== 'home' ? `%s | ${domain()}` : domain()}
	twitter={{
		cardType: 'summary',
		site: '@ryoppippi',
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

	:root {
		view-transition-name: none;
	}

	#nprogress {
		pointer-events: none;
	}

	#nprogress {
		--np-bg-color: theme('colors.accent.100');
	}

	#nprogress .bar {
		background: var(--np-bg-color);

		position: fixed;
		z-index: 1031;
		top: 0;
		left: 0;

		width: 100%;
		height: 2px;
	}

	/* Fancy blur effect */
	#nprogress .peg {
		display: block;
		position: absolute;
		right: 0px;
		width: 100px;
		height: 100%;
		box-shadow: 0 0 10px var(--np-bg-color), 0 0 5px var(--np-bg-color);
		opacity: 1.0;

		-webkit-transform: rotate(3deg) translate(0px, -4px);
		-ms-transform: rotate(3deg) translate(0px, -4px);
		transform: rotate(3deg) translate(0px, -4px);
	}
}
</style>

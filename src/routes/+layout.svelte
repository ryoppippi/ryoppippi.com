<script>
	import 'uno.css';
	import '@unocss/reset/tailwind.css';

	import faviconLinks from 'virtual:favicons';
	import { MetaTags } from 'svelte-meta-tags';
	import * as ufo from 'ufo';
	import { page, updated } from '$app/stores';

	import { onNavigate } from '$app/navigation';

	import Nav from '$lib/Nav.svelte';
	import DarkMode from '$lib/DarkMode';

	import ryoppippi from '$lib/assets/ryoppippi.png';

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

	// eslint-disable-next-line node/prefer-global/process
	const title = ufo.parseURL(process.env.DOMAIN).host;
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
		// eslint-disable-next-line node/prefer-global/process
		url: process.env.DOMAIN,
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
	max-w-4xl
	mxa
	my3
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

	@keyframes enter {
		0% {
			opacity: 0;
			transform: translateY(10px);
		}

		to {
			opacity: 1;
			transform: none;
		}
	}

	[data-sliding-animate] {
		--stagger: 0;
		--delay: 80ms;
		--start: 300ms;
	}

	[data-sliding-animate] {
		opacity: 0;
		animation: enter 0.6s both;
		animation-iteration-count: 1;
		animation-delay: calc(var(--stagger) * var(--delay) + var(--start));
		--at-apply: motion-reduce:animate-none;
	}
}
</style>

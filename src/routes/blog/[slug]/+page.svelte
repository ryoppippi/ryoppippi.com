<script lang='ts'>
	import '@shikijs/twoslash/style-rich.css';
	import 'markdown-it-github-alerts/styles/github-colors-light.css';
	import 'markdown-it-github-alerts/styles/github-colors-dark-class.css';
	import 'markdown-it-github-alerts/styles/github-base.css';
	import './link-card.css';

	import { formatDate, subdomain } from '$lib/util';
	import { page } from '$app/stores';

	const { data } = $props();
	const { metadata, Markdown, slug } = data;

	const shareText = (account: string) => encodeURIComponent(`Reading ${account}\'s ${subdomain($page.url.pathname)}\n\nI think...`);
	const tweetUrl = `https://twitter.com/intent/tweet?text=${shareText('@ryoppippi')}`;
	const bskyUrl = `https://bsky.app/intent/compose?text=${shareText('@ryoppippi.com')}`;

	$inspect(tweetUrl);

/* eslint svelte/no-at-html-tags: 0 */
</script>

<svelte:head>
	<meta content='article' property='og:type' />
</svelte:head>

<div
	min-w-0
	mxa
>
	{#if !metadata.isPublished}
		<p bg-red text='4xl center'>This article is not published yet.</p>
	{/if}

	<hgroup fcol fyc gap-1 mb-3 text-center>
		<LargeTitle
			opacity={false}
			selectDisabled={false}
			title={metadata.title}
			viewTransitionName='blog-{metadata.slug}'
		/>
		<p text-text-400>{formatDate(new Date(metadata.pubDate))} ・ {metadata.readingTime.text}</p>
	</hgroup>

	<div p2>
		<hr ma max-w-100 op25 w-full />
	</div>

	<article class='*prose-base slide-enter-content' mxa pb-8 text-text='700 dark:200'>
		<Markdown />
	</article>
	<div op50 pb-8 prose>
		<span op70>comment on</span>
		<a href={bskyUrl} target='_blank'>bluesky</a>
		<span op35> / </span>
		<a href={tweetUrl} target='_blank'>twitter</a>
	</div>

	<div op50 pb-8>
		<a href='https://creativecommons.org/licenses/by-nc-sa/4.0/' target='_blank'>CC BY-NC-SA 4.0</a> 2022-PRESENT © ryoppippi
	</div>
</div>

<style>
a {
	--at-apply: no-underline hover:underline
}

:global {
	a.header-anchor {
		float: left;
		margin-top: 0.125em;
		margin-left: -1.2em;
		padding-right: 0.5em;
		font-size: 0.85em;
		opacity: 0;
		text-decoration: none;
		border: 0 !important;
	}
	a.header-anchor:hover,
	a.header-anchor:focus {
		text-decoration: none;
	}
	h1:hover .header-anchor,
	h1:focus .header-anchor,
	h2:hover .header-anchor,
	h2:focus .header-anchor,
	h3:hover .header-anchor,
	h3:focus .header-anchor,
	h4:hover .header-anchor,
	h4:focus .header-anchor,
	h5:hover .header-anchor,
	h5:focus .header-anchor,
	h6:hover .header-anchor,
	h6:focus .header-anchor {
		opacity: 0.5;
	}

	.prose figure figcaption {
		color: theme('colors.text.400');
		font-size: 0.875em;
		line-height: 1.4285714;
		margin-top: 0.8571429em;
	}

	.prose {
		--un-prose-borders: #7d7d7d4d !important;
	}

	html.dark .shiki,
	html.dark .shiki span {
		color: var(--shiki-dark) !important;
		background-color: var(--shiki-dark-bg) !important;
		/* Optional, if you also want font styles */
		font-style: var(--shiki-dark-font-style) !important;
		font-weight: var(--shiki-dark-font-weight) !important;
		text-decoration: var(--shiki-dark-text-decoration) !important;
	}

	html:not(.dark) .shiki {
		background-color: theme('colors.text.150') !important;
	}

	html:not(.no-sliding) .slide-enter-content > * {
		--at-apply: sliding-animation
	}

	.slide-enter-content > *:nth-child(1) { --stagger: 1; }
	.slide-enter-content > *:nth-child(2) { --stagger: 2; }
	.slide-enter-content > *:nth-child(3) { --stagger: 3; }
	.slide-enter-content > *:nth-child(4) { --stagger: 4; }
	.slide-enter-content > *:nth-child(5) { --stagger: 5; }
	.slide-enter-content > *:nth-child(6) { --stagger: 6; }
	.slide-enter-content > *:nth-child(7) { --stagger: 7; }
	.slide-enter-content > *:nth-child(8) { --stagger: 8; }
	.slide-enter-content > *:nth-child(9) { --stagger: 9; }
	.slide-enter-content > *:nth-child(10) { --stagger: 10; }
	.slide-enter-content > *:nth-child(11) { --stagger: 11; }
	.slide-enter-content > *:nth-child(12) { --stagger: 12; }
	.slide-enter-content > *:nth-child(13) { --stagger: 13; }
	.slide-enter-content > *:nth-child(14) { --stagger: 14; }
	.slide-enter-content > *:nth-child(15) { --stagger: 15; }
	.slide-enter-content > *:nth-child(16) { --stagger: 16; }
	.slide-enter-content > *:nth-child(17) { --stagger: 17; }
	.slide-enter-content > *:nth-child(18) { --stagger: 18; }
	.slide-enter-content > *:nth-child(19) { --stagger: 19; }
	.slide-enter-content > *:nth-child(20) { --stagger: 20; }
}
</style>

<script>
	import HeadTitle from '$lib/HeadTitle.svelte';
	import { domain, formatDate } from '$lib/util';
	import { page } from '$app/stores';

	const { data } = $props();

	const shareText = encodeURIComponent(`Reading @ryoppippi\'s ${domain()}${$page.url}\n\nI think...`);
	const tweetUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
	const bskyUrl = `https://bsky.app/intent/compose?text=${shareText}`;

	$inspect(tweetUrl);
/* eslint svelte/no-at-html-tags: 0 */
</script>

<HeadTitle title='{data.title} | blog' />
<svelte:head>
	<meta content='article' property='og:type' />
	<meta content={data.title} property='og:title' />
</svelte:head>

<div
	max-w-xl
	min-w-0
	mxa
>
	<hgroup fcol fyc gap-1 mb-3 text-center>
		<h1
			style:view-transition-name='blog-{data.slug}'
			f-text-32-64
			line-height-none
			pb-4
			text-primary-100
		>
			{data.title}
		</h1>
		<p>Date: {formatDate(new Date(data.pubDate))}</p>
		<p>Reading time: {data.readingTime.text}</p>
	</hgroup>

	<div p2>
		<hr ma max-w-100 op25 w-full />
	</div>

	<article class='*prose-base' mx-10 pb-8>
		{@html data.content}
	</article>
	<div op50 pb-8 prose>
		<span op50>comment on</span>
		<a href={bskyUrl} target='_blank'>bluesky</a>
		<span op25> / </span>
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

	html.dark .shiki,
	html.dark .shiki span {
		color: var(--shiki-dark) !important;
		background-color: var(--shiki-dark-bg) !important;
		/* Optional, if you also want font styles */
		font-style: var(--shiki-dark-font-style) !important;
		font-weight: var(--shiki-dark-font-weight) !important;
		text-decoration: var(--shiki-dark-text-decoration) !important;
	}
}
</style>

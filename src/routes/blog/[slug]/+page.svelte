<script lang='ts'>
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import LargeTitle from '$components/LargeTitle.svelte';
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import { formatDate } from '$lib/util';
	import * as ufo from 'ufo';
	import '@shikijs/twoslash/style-rich.css';
	import 'markdown-it-github-alerts/styles/github-colors-light.css';
	import 'markdown-it-github-alerts/styles/github-colors-dark-class.css';
	import 'markdown-it-github-alerts/styles/github-base.css';
	import './link-card.css';
	import './magic-link.css';
	import './prose.css';
	import './anchor.css';

	const { data } = $props();
	const { metadata, Markdown } = data;

	const url = ufo.joinURL(PUBLIC_ORIGIN, page.url.pathname);
	const shareText = (account: string) => encodeURIComponent(`Reading ${account}\'s ${url}\n\nI think...`);
	const tweetUrl = `https://twitter.com/intent/tweet?text=${shareText('@ryoppippi')}`;
	const bskyUrl = `https://bsky.app/intent/compose?text=${shareText('@ryoppippi.com')}`;

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

	<article class={['prose dark:prose-invert', !dev && 'slide-enter-content']} mxa pb-8 text-text='700 dark:200'>
		<Markdown />
	</article>
	<div op50 pb-8>
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
	--uno: no-underline hover:underline
}
</style>

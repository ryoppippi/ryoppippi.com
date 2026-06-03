<script lang='ts'>
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import Icon from '$components/Icon.svelte';
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
	import './collapse.css';
	import './article.css';

	const { data } = $props();
	const { metadata, Markdown } = data;

	const url = ufo.joinURL(PUBLIC_ORIGIN, page.url.pathname);
	const mdUrl = `${page.url.pathname}.md`;
	const shareText = (account: string) => encodeURIComponent(`Reading ${account}\'s ${url}\n\nI think...`);
	const tweetUrl = `https://twitter.com/intent/tweet?text=${shareText('@ryoppippi')}`;
	const bskyUrl = `https://bsky.app/intent/compose?text=${shareText('@ryoppippi.com')}`;

/* eslint svelte/no-at-html-tags: 0 */
</script>

<svelte:head>
	<meta content='article' property='og:type' />
	<link href={mdUrl} rel='alternate' title='Markdown source' type='text/plain' />
</svelte:head>

<div class='mx-auto min-w-0'
>
	{#if !metadata.isPublished}
		<p class='bg-red-500 text-center text-4xl'>This article is not published yet.</p>
	{/if}

	<hgroup class='fcol fyc mb-3 gap-1 text-center'>
		<LargeTitle
			opacity={false}
			selectDisabled={false}
			title={metadata.title}
			viewTransitionName='blog-{metadata.slug}'
		/>
		<p class='text-text-400'>{formatDate(new Date(metadata.pubDate))} ・ {metadata.readingTime.text} ・ <a class='opacity-70 hover:opacity-100' aria-label='Markdown source' href={mdUrl} rel='noopener noreferrer' target='_blank'><Icon class='icon-[ri--markdown-line] inline align-middle' aria-hidden='true' /></a></p>
	</hgroup>

	<div class='p-2'>
		<hr class='m-auto w-full max-w-100 opacity-25' />
	</div>

	<article
		class={[
			'prose',
			'mx-auto',
			'pb-8',
			['text-text-700', 'dark:text-text-200'],
			'dark:prose-invert',
			!dev && 'slide-enter-content',
		]}
	>
		<Markdown />
	</article>
	<div class='pb-8 opacity-50'>
		<span class='opacity-70'>comment on</span>
		<a href={bskyUrl} rel='noopener noreferrer' target='_blank'>bluesky</a>
		<span class='opacity-35'> / </span>
		<a href={tweetUrl} rel='noopener noreferrer' target='_blank'>twitter</a>
	</div>

	<div class='pb-8 opacity-50'>
		<a href='https://creativecommons.org/licenses/by-nc-sa/4.0/' rel='noopener noreferrer' target='_blank'>CC BY-NC-SA 4.0</a> 2022-PRESENT © ryoppippi
	</div>
</div>

<style>
a {
	text-decoration-line: none;
}

a:hover {
	text-decoration-line: underline;
}
</style>

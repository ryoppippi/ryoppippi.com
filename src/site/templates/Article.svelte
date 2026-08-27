<script lang='ts'>
	import { loadDefaultJapaneseParser } from 'budoux';
	import { createRawSnippet } from 'svelte';
	import type { BlogPost } from '@ryoppippi/content';
	import { SITE_COPYRIGHT, SITE_ORIGIN } from '../consts.ts';

	const budoux = loadDefaultJapaneseParser();
	let { date, pathname, post }: { date: string; pathname: string; post: BlogPost } = $props();
	const markdownPath = $derived(`${pathname.slice(0, -1)}.md`);
	const content = $derived(createRawSnippet(() => ({ render: () => post.html })));
	const title = $derived(budoux.parse(post.title).join('\u200B'));
	const url = $derived(`${SITE_ORIGIN}${pathname}`);
	const blueskyUrl = $derived(`https://bsky.app/intent/compose?text=${encodeURIComponent(`Reading @ryoppippi.com's ${url}\n\nI think...`)}`);
	const tweetUrl = $derived(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Reading @ryoppippi's ${url}\n\nI think...`)}`);
</script>

<link href={markdownPath} rel='alternate' title='Markdown source' type='text/plain' />

<div class='mx-auto min-w-0'>
	{#if !post.isPublished}
		<p class='mt-4 rounded bg-red-500 p-2 text-center text-xl font-bold text-white'>This article is not published yet.</p>
	{/if}

	<hgroup class='fcol fyc mb-3 gap-1 text-center'>
		<h1
			class={[
				'f-text-32-64',
				'my-8',
				'break-keep',
				'wrap-anywhere',
				'font-mono',
				'font-bold',
				'leading-none',
				'text-stroke-aaa',
				'text-transparent',
			]}
			style={`view-transition-name:blog-${post.filename}`}
		>{title}</h1>
		<p class='text-text-400'>
			{date} ・ {post.readingTime.text} ・
			<a class='opacity-70 hover:opacity-100' aria-label='Markdown source' href={markdownPath} rel='noopener noreferrer' target='_blank'>
				<span class='icon-[ri--markdown-line] size-6 align-middle' aria-hidden='true'></span>
			</a>
		</p>
	</hgroup>

	<div class='p-2'>
		<hr class='m-auto w-full max-w-100 opacity-25' />
	</div>

	<article
		class={[
			'content',
			'prose',
			'mx-auto',
			'max-w-none',
			'pb-8',
			'text-text-700',
			'dark:prose-invert',
			'dark:text-text-200',
		]}
	>
		{@render content()}
	</article>

	<div class='pb-8 opacity-50'>
		<span class='opacity-70'>comment on</span>
		<a href={blueskyUrl} rel='noopener noreferrer' target='_blank'>bluesky</a>
		<span class='opacity-35'> / </span>
		<a href={tweetUrl} rel='noopener noreferrer' target='_blank'>twitter</a>
	</div>

	<div class='pb-8 opacity-50'>
		<a href='https://creativecommons.org/licenses/by-nc-sa/4.0/' rel='noopener noreferrer' target='_blank'>{SITE_COPYRIGHT}</a>
	</div>
</div>

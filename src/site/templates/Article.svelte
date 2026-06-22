<script lang='ts'>
	import { createRawSnippet } from 'svelte';
	import type { BlogPost } from '@ryoppippi/content';

	let { date, pathname, post }: { date: string; pathname: string; post: BlogPost } = $props();
	const markdownPath = $derived(`${pathname.slice(0, -1)}.md`);
	const content = $derived(createRawSnippet(() => ({ render: () => post.html })));
	const url = $derived(`https://ryoppippi.com${pathname}`);
	const blueskyUrl = $derived(`https://bsky.app/intent/compose?text=${encodeURIComponent(`Reading @ryoppippi.com's ${url}\n\nI think...`)}`);
	const tweetUrl = $derived(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Reading @ryoppippi's ${url}\n\nI think...`)}`);
</script>

<link href={markdownPath} rel='alternate' title='Markdown source' type='text/plain' />

<div class='mx-auto min-w-0'>
	<hgroup class='fcol fyc mb-3 gap-1 text-center'>
		<h1 class='f-text-32-64 my-8 font-mono font-bold leading-none text-stroke-aaa text-transparent' style={`view-transition-name:blog-${post.filename}`}>{post.title}</h1>
		<p class='text-text-400'>
			{date} ・ {post.readingTime.text} ・
			<a class='opacity-70 hover:opacity-100' aria-label='Markdown source' href={markdownPath} rel='noopener noreferrer' target='_blank'>
				<span class='icon-[ri--markdown-line] align-middle' aria-hidden='true'></span>
			</a>
		</p>
	</hgroup>

	<div class='p-2'>
		<hr class='m-auto w-full max-w-100 opacity-25' />
	</div>

	<article class='prose mx-auto pb-8 text-text-700 dark:prose-invert dark:text-text-200'>
		{@render content()}
	</article>

	<div class='pb-8 opacity-50'>
		<span class='opacity-70'>comment on</span>
		<a href={blueskyUrl} rel='noopener noreferrer' target='_blank'>bluesky</a>
		<span class='opacity-35'> / </span>
		<a href={tweetUrl} rel='noopener noreferrer' target='_blank'>twitter</a>
	</div>

	<div class='pb-8 opacity-50'>
		<a href='https://creativecommons.org/licenses/by-nc-sa/4.0/' rel='noopener noreferrer' target='_blank'>CC BY-NC-SA 4.0</a>
		2022-PRESENT © ryoppippi
	</div>
</div>

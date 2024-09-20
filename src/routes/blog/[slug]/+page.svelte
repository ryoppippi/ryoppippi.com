<script>
	import { formatDate } from '$lib/util.js';

	const { data } = $props();
/* eslint svelte/no-at-html-tags: 0 */
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta content='article' property='og:type' />
	<meta content={data.title} property='og:title' />
</svelte:head>

<article
	max-w-xl
	min-w-0
	mxa
	w-xl
>
	<hgroup fcol gap-1 items-center mb-3>
		<h1 text='6xl primary-100'>
			{data.title}
		</h1>
		<p>Date: {formatDate(new Date(data.pubDate))}</p>
		<p>Reading time: {data.readingTime.text}</p>
	</hgroup>

	<div p2>
		<hr ma op25 w-100 />
	</div>

	<article prose='~ dark:invert'>
		{@html data.content}
	</article>
</article>

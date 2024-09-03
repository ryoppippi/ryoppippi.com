<script>
	import Markdown from 'svelte-exmarkdown';
	import { formatDate } from '$lib/util.js';

	const { data } = $props();
/* eslint svelte/no-at-html-tags: 0 */
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta content='article' property='og:type' />
	<meta content={data.title} property='og:title' />
</svelte:head>

<article>
	<hgroup fcol text-text-100>
		<h1
			justify-start
			text='5xl primary-100'
		>
			{data.title}
		</h1>
		<div flex gap-2>
			<p>{formatDate(new Date(data.pubDate))}</p>
			<p> Reading time: {data.readingTime.text}</p>
		</div>
	</hgroup>

	<div p2>
		<hr ma op25 w-50 />
	</div>

	<div text-text-100>
		<Markdown md={data.content} />
	</div>
</article>

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
	<hgroup flex='~ clo'>
		<h1
			justify-start
			text='5xl primary-100'
		>
			<!-- {data.meta.title} -->
		</h1>
		<p>{formatDate(new Date(data.pubDate))}</p>
	</hgroup>

	<div text-text-100>
		<Markdown md={data.content} />
	</div>
</article>

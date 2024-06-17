<script>
	export let data;

	import { formatDate } from '$lib/util.js';

/* eslint svelte/no-at-html-tags: 0 */
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta content='article' property='og:type' />
	<meta content={data.meta.title} property='og:title' />
</svelte:head>

<article>
	<hgroup class='flex flex-col'>
		<h1 class='justify-start text-5xl text-me-primary-100'>{data.meta.title}</h1>
		<p>{formatDate(new Date(data.meta.pubDate))}</p>
	</hgroup>

	<div class='prose'>
		{@html data.content}
	</div>
</article>

<script>
	import Title from '$lib/Title.svelte';
	import { formatDate } from '$lib/util';

	const { data } = $props();
/* eslint svelte/no-at-html-tags: 0 */
</script>

<Title title='{data.title} | blog' />
<svelte:head>
	<meta content='article' property='og:type' />
	<meta content={data.title} property='og:title' />
</svelte:head>

<article
	max-w-xl
	min-w-0
	mxa
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

	<article mx-10 prose='~ dark:invert'>
		{@html data.content}
	</article>
</article>

<style>
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
	}
</style>

<script>
	export let data;

	import { formatDate } from '$lib/util.js';

	$: date = new Date(data.meta.date);
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title} />
</svelte:head>

<article>
	<hgroup class="flex flex-col">
		<h1 class="justify-start text-5xl text-me-primary-100">{data.meta.title}</h1>
		<p>{formatDate(new Date(data.meta.pubDate))}</p>
	</hgroup>

	<div class="prose">
		<svelte:component this={data.content} />
	</div>
</article>

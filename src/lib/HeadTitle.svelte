<script lang='ts'>
	import { domain } from './util';

	const { title }: { title?: string } = $props();

	const displayTitle = (title != null ? `${title} | ` : '') + domain();
</script>

<svelte:head>
	<title> {displayTitle} </title>
	<meta content={displayTitle} property='og:title' />
	<meta name='twitter:title' content={displayTitle} />
</svelte:head>

<script lang='ts'>
	import { domain } from './util';

	const { title }: { title?: string } = $props();

</script>

<svelte:head>
	<title>{title != null ? `${title} |` : ''}  {domain()}</title>
</svelte:head>

<script lang='ts'>
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();
</script>

<ol class='relative border-gray-700 md:border-l'>
	{#if children}
		{@render children()}
	{/if}
</ol>

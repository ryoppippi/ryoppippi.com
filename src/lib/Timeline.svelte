<script lang='ts'>
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();
</script>

<ol
	border-gray-700
	md-border-l
	relative
>
	{#if children}
		{@render children()}
	{/if}
</ol>

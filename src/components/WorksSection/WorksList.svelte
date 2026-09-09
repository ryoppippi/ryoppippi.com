<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<ul>{@render children()}</ul>

<style>
	ul {
		margin-inline: auto;
		padding-inline: 2.5rem;
	}
</style>

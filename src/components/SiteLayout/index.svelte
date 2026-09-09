<script lang="ts">
	import SiteHeader from './SiteHeader.svelte';

	type SiteLayoutProps = {
		content: string;
		pathname: string;
	};

	let { content, pathname }: SiteLayoutProps = $props();
</script>

<span data-nosnippet>
	<a class="skipLink" href="#main-content">Skip to content</a>
</span>
<div class="siteLayout">
	<SiteHeader {pathname}></SiteHeader>
	<main id="main-content" tabindex="-1">{@html content}</main>
</div>

<style>
	.siteLayout {
		max-width: 56rem;
		margin: 0.75rem auto;
		padding-inline: 2rem;
	}
	.skipLink {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
	.skipLink:focus {
		position: fixed;
		top: 1rem;
		left: 1rem;
		z-index: 50;
		width: auto;
		height: auto;
		margin: 0;
		padding: 0.5rem 1rem;
		overflow: visible;
		clip-path: none;
		white-space: normal;
		border-radius: 0.25rem;
		background-color: #ffffff;
		color: var(--color-text-800);
		box-shadow:
			0 10px 15px -3px rgb(0 0 0 / 10%),
			0 4px 6px -4px rgb(0 0 0 / 10%);
		outline: 2px solid var(--color-accent-100);
	}
	:global(html.dark) .skipLink:focus {
		background-color: var(--color-bg-100);
		color: var(--color-text-100);
	}
	@media (prefers-color-scheme: dark) {
		:global(html:not(.js)) .skipLink:focus {
			background-color: var(--color-bg-100);
			color: var(--color-text-100);
		}
	}
</style>

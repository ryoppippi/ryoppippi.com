<script lang="ts">
	import NavigationLinks from './NavigationLinks.svelte';

	import NavigationActions from './NavigationActions.svelte';

	let { pathname }: { pathname: string } = $props();

	const isHome = $derived(pathname === '/');
</script>

<header class="siteHeader">
	<div data-nosnippet class={`siteBrandSlot${isHome ? ` siteBrandSlotHome` : ''}`}>
		{#if !isHome}<a class="siteBrand" aria-label="Home" href="/"
				><span style="view-transition-name:title-ryoppippi">@ryoppippi</span></a
			>{/if}
	</div>
	<nav class="siteNavigation" aria-label="Primary navigation">
		<NavigationLinks {pathname}></NavigationLinks><NavigationActions></NavigationActions>
	</nav>
</header>

<style>
	.siteHeader {
		display: grid;
		align-items: center;
		row-gap: 1.5rem;
		margin-inline: auto;
		padding-block: 1.5rem;
		font-size: 1.25rem;
		opacity: 0.7;
		transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.siteHeader:hover {
		opacity: 1;
	}
	.siteBrandSlot {
		display: flex;
	}
	.siteBrandSlotHome {
		display: none;
	}
	.siteBrand {
		position: relative;
		font-weight: 700;
	}
	.siteNavigation {
		display: flex;
		width: 100%;
		max-width: 100%;
		flex-direction: column;
		row-gap: 1rem;
		column-gap: 1rem;
		font-size: 1.125rem;
		font-weight: 700;
	}
	@media (min-width: 48rem) {
		.siteHeader {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.siteBrandSlotHome {
			display: flex;
		}
		.siteBrand {
			margin-inline: 0;
		}
		.siteNavigation {
			grid-column: span 2;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: flex-end;
			margin-left: auto;
			margin-right: 0;
		}
	}
	@media (max-width: 47.999rem) {
		.siteBrand {
			margin-inline: auto;
		}
		.siteNavigation {
			align-items: center;
			margin-inline: auto;
		}
	}
</style>

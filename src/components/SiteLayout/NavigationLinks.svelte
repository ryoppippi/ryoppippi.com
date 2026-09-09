<script lang="ts">
	type NavigationLink = {
		activePrefix?: string;
		href: string;
		label: string;
	};

	const navigationLinks = [
		{ href: '/about/', label: 'about' },
		{ href: '/works/oss/', label: 'works', activePrefix: '/works/' },
		{ href: '/sponsors/', label: 'sponsors' },
		{ href: '/blog/', label: 'blog' },
	] as const satisfies readonly NavigationLink[];

	let { pathname }: { pathname: string } = $props();
</script>

<div data-nosnippet class="siteNavigationLinks">
	{#each navigationLinks as link}
		{const active = $derived(
			pathname.startsWith('activePrefix' in link ? link.activePrefix : link.href),
		)}
		<a class="siteNavigationLink" aria-current={active ? 'page' : undefined} href={link.href}>
			<span>{link.label}</span>
			<span class={['siteNavigationMarker', active && 'siteNavigationMarkerActive']}></span>
		</a>
	{/each}
</div>

<style>
	.siteNavigationLinks {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
	}
	.siteNavigationLink {
		position: relative;
		display: block;
		flex-shrink: 0;
		white-space: nowrap;
	}
	.siteNavigationMarker {
		position: absolute;
		top: 100%;
		left: 0;
		width: 100%;
		height: 0.125rem;
		background-color: transparent;
	}
	.siteNavigationMarkerActive {
		background-color: var(--color-accent-100);
	}
</style>

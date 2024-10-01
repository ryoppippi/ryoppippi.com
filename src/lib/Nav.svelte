<script lang='ts'>
	import { subdomain } from './util';
	import { page } from '$app/stores';

	import * as DarkMode from '$lib/DarkMode';

	const LINKS = [
		{ name: 'projects', href: '/projects' },
		{ name: 'blog', href: '/blog' },
		{ name: 'cv', href: subdomain('/cv'), icon: 'i-line-md:download-outline' },
	] as const satisfies { href: string; name: string; icon?: string }[];
</script>

{#snippet underline(isPath: boolean, transparentDefault = false)}
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<span
		class:bg-primary-100={isPath}
		class:bg-transparent={!isPath || transparentDefault}
		class:view-transition--nav-underline={isPath}
		absolute
		h-0.5
		w-full
	/>
{/snippet}

<header
	fcol
	fyc
	gap-y-lg
	grid
	grid-cols='1 md:3'
	mxa
	op='card hover:100'
	py-6
	text-xl
	transition-base
>
	<div flex>
		<a
			font-bold
			href='/'
			m='xa md:(b0 x0)'
			relative
		>
			<div
				style:view-transition-name='title-ryoppippi'
				class:hidden={$page.url.pathname === '/'}
			>
				@ryoppippi
			</div>
			<div>{@render underline($page.url.pathname === '/', true)}</div>
		</a>
	</div>
	<nav
		col-span-2
		font-bold
		fw
		fxe
		gap-4
		m='xa md:r0'
		text-lg
	>
		{#each LINKS as { href, name, ...rest } (href)}
			{@const isPath = $page.url.pathname.startsWith(href)}
			{@const icon = 'icon' in rest ? rest.icon : null}
			<a
				style:view-transition-name='-nav-link-{name}'
				block
				{href}
				px-0
				relative
				target={href.startsWith('http') ? '_blank' : undefined}
			>
				<div fyc>
					{name}
					<!-- svelte-ignore element_invalid_self_closing_tag -->
					{#if icon != null} <span class={icon} /> {/if}
				</div>
				{@render underline(isPath, false)}
			</a>
		{/each}
		<div flex gap-2 view-transition--nav-icons>
			<DarkMode.ToggleButton />
			<a
				class='i-line-md:rss'
				fyc
				href='/blog/feed.xml'
				mya
				target='_blank'
			>
				souce code
			</a>
			<a
				class='i-teenyicons:github-solid'
				fyc
				href='https://github.com/ryoppippi/ryoppippi.com'
				mya
				target='_blank'
			>
				souce code
			</a>
		</div>
	</nav>
</header>

<style>
	a{
		--at-apply: no-underline;
	}
</style>

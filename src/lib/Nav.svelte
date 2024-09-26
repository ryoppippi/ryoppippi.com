<script lang='ts'>
	import process from 'node:process';
	import { joinURL } from 'ufo';
	import { page } from '$app/stores';

	import * as DarkMode from '$lib/DarkMode';

	const LINKS = [
		{ name: 'works', href: '/works' },
		{ name: 'blog', href: '/blog' },
		{ name: 'cv', href: joinURL(process.env.DOMAIN as string, '/cv'), icon: 'i-line-md:download-outline' },
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
	container
	fcol
	gap-y-lg
	grid='~ cols-1 md:cols-3'
	items-center
	mxa
	py-6
	text-xl
>
	<div flex>
		<a
			font-bold
			href='/'
			m='xa md:(x0 b0)'
			relative
		>
			<div
				class:hidden={$page.url.pathname === '/'}
				view-transition--title
			>
				@ryoppippi
			</div>
			<div>{@render underline($page.url.pathname === '/', true)}</div>
		</a>
	</div>
	<nav
		col-span-2
		flex='~ wrap'
		font-bold
		gap-4
		justify-end
		m='xa md:r0'
		text-lg
	>
		{#each LINKS as { href, name, ...rest } (href)}
			{@const isPath = $page.url.pathname === href}
			{@const icon = 'icon' in rest ? rest.icon : null}
			<a
				style:view-transition-name='-nav-link-{name}'
				block
				{href}
				px-0
				relative
				target={href.startsWith('http') ? '_blank' : undefined}
			>
				<div
					flex='~'
					items-center
				>
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
				class='i-teenyicons:github-solid'
				flex='~'
				href='https://github.com/ryoppippi/ryoppippi.com'
				items-center
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

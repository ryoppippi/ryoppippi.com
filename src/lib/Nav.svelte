<script lang='ts'>
	import process from 'node:process';
	import { joinURL } from 'ufo';
	import { page } from '$app/stores';

	import * as DarkMode from '$lib/DarkMode';

	const TITLE = 'ryoppippi' as const satisfies string;
	const LINKS = [
		{ name: 'works', href: '/works' },
		{ name: 'blog', href: '/blog' },
		{ name: 'cv', href: joinURL(process.env.DOMAIN as string, '/cv'), icon: 'i-line-md:download-outline' },
	] as const satisfies { href: string; name: string; icon?: string }[];
</script>

<header
	container
	fcol
	grid='~ cols-1 md:cols-3'
	items-center
	max-w-xl
	min-w-0
	mxa
	py-6
	text-xl
>
	<div flex justify-start>
		<a
			font-bold
			href='/'
			m='xa md:(x0 b0)'
		>
			{TITLE}
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
				class:border-primary-100={isPath}
				class:border-transparent={!isPath}
				block
				border='b-2 hover:primary-100'
				flex='~'
				{href}
				items-center
				px-0
				py-3
				tatget={href.startsWith('http') ? '_blank' : undefined}
			>
				{name}
				<!-- svelte-ignore element_invalid_self_closing_tag -->
				{#if icon != null} <span class={icon} /> {/if}
			</a>
		{/each}
		<DarkMode.ToggleButton />
	</nav>
</header>

<style>
	a{
		--at-apply: no-underline;
	}
</style>

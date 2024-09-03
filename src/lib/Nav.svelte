<script lang='ts'>
	import { page } from '$app/stores';

	const TITLE = 'ryoppippi' as const satisfies string;
	const LINKS = [
		// { href: '/me', name: 'me' },
		// { link: '/works', name: 'works' },
		{ href: '/blog', name: 'blog' },
	] as const satisfies Readonly<{ href: string; name: string }[]>;
</script>

<header
	container
	fcol
	grid='~ cols-1 md:cols-3'
	items-center
	max-w-8xl
	mxa
	p-5
	py-6
	text-text-100
>
	<div flex justify-end>
		<a
			font-bold
			href='/'
			mb='md:0'
			mx='a md:0'
		>
			{TITLE}
		</a>
	</div>
	<nav
		flex='~ wrap'
		gap-3
		mxa
		text-base
	>
		{#each LINKS as { href, name } (href)}
			<a
				class:nav-underline={$page.url.pathname === href}
				block
				font-bold
				{href}
				nav-underline='hover:~'
				px-0
				py-3
				text-xl
			>
				{name}
			</a>
		{/each}
	</nav>
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<div
		flex
		justify-start
		mx='a md:0'
	>
		<a
			flex='~'
			font-bold
			href='https://cv.ryoppippi.com'
			items-center
			opacity='90 hover:100'
			px-6
			py-2
			target='_blank'
		>
			My CV <span class='i-line-md:download-outline' />
		</a>
	</div>
</header>

<style>
	a{
		--at-apply: no-underline;
	}
</style>

<script lang='ts'>
	import process from 'node:process';
	import { joinURL } from 'ufo';
	import { page } from '$app/stores';

	const TITLE = 'ryoppippi' as const satisfies string;
	const LINKS = [
		{ href: '/works', name: 'works' },
		{ href: '/blog', name: 'blog' },
	] as const satisfies Readonly<{ href: string; name: string }[]>;
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
	<div
		col-span-2
		flex='~ md:row col'
		justify-end
	>
		<nav
			flex='~ wrap'
			gap-3
			m='xa md:r0'
		>
			{#each LINKS as { href, name } (href)}
				{@const isPath = $page.url.pathname === href}
				<a
					class:border-primary-100={isPath}
					class:border-transparent={!isPath}
					block
					border='b-2 hover:primary-100'
					font-bold
					{href}
					px-0
					py-3
					text-lg
				>
					{name}
				</a>
			{/each}
		</nav>
		<!-- svelte-ignore element_invalid_self_closing_tag -->
		<div
			flex
			mx='a md:0'
		>
			<a
				flex='~'
				font-bold
				href={joinURL(process.env.DOMAIN as string, '/cv')}
				items-center
				opacity='90 hover:100'
				px-6
				py-2
				target='_blank'
			>
				CV <span class='i-line-md:download-outline' />
			</a>
		</div>
	</div>
</header>

<style>
	a{
		--at-apply: no-underline;
	}
</style>

<script lang='ts'>
	import { page } from '$app/stores';

	const TITLE = 'ryoppippi' as const satisfies string;
	const LINKS = [
		{ href: '/me', name: 'me' },
		// { link: '/works', name: 'works' },
		{ href: '/blog', name: 'blog' },
	] as const satisfies Readonly<{ href: string; name: string }[]>;
	const CVMessage = `My CV `;
</script>

<header py-6>
	<div
		container
		flex='~ col wrap md:row'
		items-center
		max-w-8xl
		mx-auto
		p-5
		text-text-100
	>
		<a
			flex
			font-bold
			href='/'
			items-center
			mb='md:0'
		>
			{TITLE}
		</a>
		<nav
			flex='~ wrap'
			gap-3
			items-center
			justify-center
			mx='md:auto'
			text-base
		>
			{#each LINKS as { href, name } (href)}
				<a
					block
					border='b-2 transparent hover:primary-100'
					font-bold
					{href}
					px-0
					py-3
					text-xl
				>
					{name}
				</a>
			{/each}
		</nav>
		<!-- svelte-ignore element_invalid_self_closing_tag -->
		<a
			btn
			font-bold
			href='https://cv.ryoppippi.com'
			mt='4 md:0'
			opacity='90 hover:100'
			px-6
			py-2
			target='_blank'
			variant='glass-primary hover:filled-primary'
		>
			{CVMessage}
			<div class='i-line-md:download-outline' />
		</a>
	</div>
</header>

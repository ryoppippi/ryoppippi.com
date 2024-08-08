<script lang='ts'>
	import { page } from '$app/stores';

	const TITLE = 'ryoppippi' as const satisfies string;
	const LINKS = [
		{ link: '/me', name: 'me' },
		// { link: '/works', name: 'works' },
		{ link: '/blog', name: 'blog' },
	] as const satisfies Readonly<{ link: string; name: string }[]>;
	const CVMessage = `My CV `;
</script>

<header class='py-6'>
	<div class='max-w-8xl container mx-auto flex flex-col flex-wrap items-center p-5 md:flex-row'>
		<a class='title-font flex items-center text-xl font-bold text-me-text-100 md:mb-0' href='/'>
			{TITLE}
		</a>
		<nav class='flex flex-wrap items-center justify-center gap-3 text-base md:mx-auto'>
			{#each LINKS as l (l.name)}
				{@const { link, name } = l}
				<a
					class='block border-b-2 border-transparent px-0 py-3 font-bold hover:border-me-primary-100'
					class:border-me-primary-100={$page.url.pathname === link}
					href={link}>
					{name}
				</a>
			{/each}
		</nav>
		<!-- svelte-ignore element_invalid_self_closing_tag -->
		<a
			class='bg-base variant-glass-primary btn mt-4 px-6 py-2 font-bold opacity-90 hover:variant-filled-primary hover:opacity-100 md:mt-0'
			href='https://cv.ryoppippi.com'
			target='_blank'>
			{CVMessage}
			<div class='i-line-md:download-outline' />
		</a>
	</div>
</header>

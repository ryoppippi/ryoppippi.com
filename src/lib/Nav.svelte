<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';

	const TITLE = 'ryoppippi' as const satisfies string;
	const LINKS = [
		{ link: '/me', name: 'me' },
		{ link: '/works', name: 'works' },
		{ link: '/blog', name: 'blog' }
	] as const satisfies Readonly<{ link: string; name: string }[]>;
</script>

<header class="py-6">
	<div class="max-w-8xl container mx-auto flex flex-col flex-wrap items-center p-5 md:flex-row">
		<a class="title-font mb-4 flex items-center font-medium text-gray-50 md:mb-0" href="/">
			<span class="ml-3 text-xl font-bold">{TITLE}</span>
		</a>
		<nav class="flex flex-wrap items-center justify-center text-base md:ml-auto md:mr-auto">
			{#each LINKS as l}
				{@const { link, name } = l}
				<a
					href={link}
					class="mr-5 block border-b-2 border-transparent px-0 py-3 font-bold hover:border-me-primary-100 lg:p-4"
					class:border-me-primary-100={$page.url.pathname === link}>
					{name}
				</a>
			{/each}
		</nav>
		<a
			href="http://cv.ryoppippi.com"
			target="_blank"
			class="bg-base btn variant-glass-primary mt-4 px-6 py-2 font-bold opacity-90 hover:variant-filled-primary hover:opacity-100 md:mt-0">
			{'My CV '}
			<Icon icon="line-md:download-loop" style="font-size: {2}vh" />
		</a>
	</div>
</header>

<script lang='ts'>
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Icon from '$components/Icon.svelte';
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import * as DarkMode from 'svelte-fancy-darkmode';
	import * as ufo from 'ufo';

	const LINKS = [
		{ name: 'works', href: '/works' },
		{ name: 'blog', href: '/blog' },
		{ name: 'sponsors', href: '/sponsors' },
	] as const satisfies { href: string; name: string }[];

	const CV_HREF = ufo.joinURL(PUBLIC_ORIGIN, '/cv');
	const isHome = $derived(page.url.pathname === '/');
</script>

{#snippet underline(isPath: boolean, transparentDefault = false)}
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<span
		class={[
			'absolute',
			'h-0.5',
			'w-full',
			{
				'bg-accent-100': isPath,
				'bg-transparent': !isPath || transparentDefault,
			},
		]}
	/>
{/snippet}

<header
	class={[
		'mx-auto',
		'grid',
		['max-md:grid-cols-1', 'md:grid-cols-3'],
		'items-center',
		'gap-y-6',
		'py-6',
		'text-xl',
		'opacity-70',
		['transition-base', 'hover:opacity-100'],
	]}
>
	<div class={isHome ? ['max-md:hidden', 'md:flex'] : 'flex'}>
		{#if !isHome}
			<a
				class={[
					'relative',
					'font-bold',
					['max-md:mx-auto', 'md:mx-0', 'md:mb-0'],
				]}
				aria-label='Home'
				href={resolve('/')}
			>
				<div style:view-transition-name='title-ryoppippi'>@ryoppippi</div>
				<div>{@render underline(isHome, true)}</div>
			</a>
		{/if}
	</div>
	<nav
		class={[
			'flex',
			'w-full',
			'max-w-full',
			'md:col-span-2',
			'flex-wrap',
			'gap-x-4',
			'gap-y-4',
			'text-lg',
			'font-bold',
			['max-md:mx-auto', 'md:ml-auto', 'md:mr-0'],
			['max-md:justify-center', 'md:justify-end'],
		]}
		aria-label='Primary navigation'
	>
		{#each LINKS as { href, name } (href)}
			{@const isPath = page.url.pathname.startsWith(href)}
			<a
				class='relative block shrink-0 whitespace-nowrap px-0'
				href={resolve(href)}
			>
				<div class='fyc'>
					{name}
				</div>
				{@render underline(isPath, false)}
			</a>
		{/each}
		<a
			class='relative block w-10 shrink-0 whitespace-nowrap px-0'
			href={CV_HREF}
			rel='noopener noreferrer'
			target='_blank'
		>
			<div class='fyc'>
				cv
				<Icon class='icon-[line-md--download-outline] size-[1em] shrink-0' aria-hidden='true' />
			</div>
			{@render underline(false, false)}
		</a>
		<div
			class={[
				'flex',
				'w-[4.375rem]',
				'justify-between',
			]}
		>
			<DarkMode.ToggleButton>
				{#snippet dark()}
					<Icon class='icon-[line-md--sunny-filled-loop-to-moon-filled-transition]' aria-hidden='true' />
				{/snippet}

				{#snippet light()}
					<Icon class='icon-[line-md--moon-filled-to-sunny-filled-loop-transition]' aria-hidden='true' />
				{/snippet}
			</DarkMode.ToggleButton>
			<a
				class='fyc my-auto'
				aria-label='RSS feed'
				href={resolve('/feed.xml')}
				rel='noopener noreferrer'
				target='_blank'
			>
				<Icon class='icon-[line-md--rss]' aria-hidden='true' />
				<span class='sr-only'>RSS feed</span>
			</a>
			<a
				class='fyc my-auto'
				aria-label='Source code on GitHub'
				href='https://github.com/ryoppippi/ryoppippi.com'
				rel='noopener noreferrer'
				target='_blank'
			>
				<Icon class='icon-[teenyicons--github-solid]' aria-hidden='true' />
				<span class='sr-only'>Source code</span>
			</a>
		</div>
	</nav>
</header>

<style>
a {
	text-decoration-line: none;
}
</style>

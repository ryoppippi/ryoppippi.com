<script lang='ts'>
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import * as DarkMode from 'svelte-fancy-darkmode';
	import * as ufo from 'ufo';
	import DownloadOutline from '~icons/line-md/download-outline';
	import MoonToSunny from '~icons/line-md/moon-filled-to-sunny-filled-loop-transition';
	import Rss from '~icons/line-md/rss';
	import SunnyToMoon from '~icons/line-md/sunny-filled-loop-to-moon-filled-transition';
	import Github from '~icons/teenyicons/github-solid';

	const LINKS = [
		{ name: 'works', href: resolve('/works') },
		{ name: 'blog', href: resolve('/blog') },
		{ name: 'sponsors', href: resolve('/sponsors') },
		{
			name: 'cv',
			href: ufo.joinURL(PUBLIC_ORIGIN, '/cv'),
			icon: DownloadOutline,
		},
	] as const satisfies { href: string; name: string; icon?: typeof DownloadOutline }[];
</script>

{#snippet underline(isPath: boolean, transparentDefault = false)}
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<span
		class={[
			'absolute h-0.5 w-full',
			{
				'bg-accent-100': isPath,
				'bg-transparent': !isPath || transparentDefault,
				'view-transition--nav-underline': isPath,
			},
		]}
	/>
{/snippet}

<header class='fcol fyc view-transition--nav mx-auto grid grid-cols-1 gap-y-6 py-6 text-xl opacity-70 transition-base hover:opacity-100 md:grid-cols-3'
>
	<div class='flex'>
		<a
			class='relative mx-auto font-bold md:mb-0 md:mx-0'
			aria-label='Home'
			href={resolve('/')}
		>
			<div
				style:view-transition-name='title-ryoppippi'
				class={{ hidden: page.url.pathname === '/' }}
			>
				@ryoppippi
			</div>
			<div>{@render underline(page.url.pathname === '/', true)}</div>
		</a>
	</div>
	<nav
		class='fxc col-span-2 mx-auto flex-wrap gap-4 text-lg font-bold md:mr-0 md:justify-end'
		aria-label='Primary navigation'
	>
		<div class='flex gap-4'>
			{#each LINKS as { href, name, ...rest } (href)}
				{@const isPath = page.url.pathname.startsWith(href)}
				{@const Icon = 'icon' in rest ? rest.icon : null}
				<a
					style:view-transition-name='-nav-link-{name}'
					class='relative block px-0'
					{href}
					rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
					target={href.startsWith('http') ? '_blank' : undefined}
				>
					<div class='fyc'>
						{name}
						{#if Icon != null} <Icon aria-hidden='true' /> {/if}
					</div>
					{@render underline(isPath, false)}
				</a>
			{/each}
		</div>
		<div class='view-transition--nav-icons flex gap-4 md:gap-2'>
			<DarkMode.ToggleButton>
				{#snippet dark()}
					<SunnyToMoon />
				{/snippet}

				{#snippet light()}
					<MoonToSunny />
				{/snippet}
			</DarkMode.ToggleButton>
			<a
				class='fyc my-auto'
				aria-label='RSS feed'
				href={resolve('/feed.xml')}
				rel='noopener noreferrer'
				target='_blank'
			>
				<Rss aria-hidden='true' />
				<span class='sr-only'>RSS feed</span>
			</a>
			<a
				class='fyc my-auto'
				aria-label='Source code on GitHub'
				href='https://github.com/ryoppippi/ryoppippi.com'
				rel='noopener noreferrer'
				target='_blank'
			>
				<Github aria-hidden='true' />
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

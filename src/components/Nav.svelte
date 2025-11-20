<script lang='ts'>
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import * as DarkMode from 'svelte-fancy-darkmode';
	import * as ufo from 'ufo';
	import MoonToSunny from '~icons/line-md/moon-filled-to-sunny-filled-loop-transition';
	import SunnyToMoon from '~icons/line-md/sunny-filled-loop-to-moon-filled-transition';

	const LINKS = [
		{ name: 'projects', href: resolve('/projects') },
		{ name: 'talks', href: resolve('/talks') },
		{ name: 'blog', href: resolve('/blog') },
		{ name: 'sponsors', href: resolve('/sponsors') },
		{
			name: 'cv',
			href: ufo.joinURL(PUBLIC_ORIGIN, '/cv'),
			icon: 'i-line-md:download-outline',
		},
	] as const satisfies { href: string; name: string; icon?: string }[];
</script>

{#snippet underline(isPath: boolean, transparentDefault = false)}
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<span
		class={{
			'bg-accent-100': isPath,
			'bg-transparent': !isPath || transparentDefault,
			'view-transition--nav-underline': isPath,
		}}
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
	view-transition--nav
>
	<div flex>
		<a
			aria-label='Home'
			font-bold
			href={resolve('/')}
			m='xa md:(b0 x0)'
			relative
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
		col-span-2
		flex='wrap  '
		font-bold
		fxc
		gap-4
		m='xa md:r0'
		md-fxe
		text-lg
	>
		<div flex gap-4>
			{#each LINKS as { href, name, ...rest } (href)}
				{@const isPath = page.url.pathname.startsWith(href)}
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
		</div>
		<div flex gap='4 md:2' view-transition--nav-icons>
			<DarkMode.ToggleButton>
				{#snippet dark()}
					<SunnyToMoon />
				{/snippet}

				{#snippet light()}
					<MoonToSunny />
				{/snippet}
			</DarkMode.ToggleButton>
			<a
				class='i-line-md:rss'
				fyc
				href={resolve('/feed.xml')}
				mya
				target='_blank'
			>
				source code
			</a>
			<a
				class='i-teenyicons:github-solid'
				fyc
				href='https://github.com/ryoppippi/ryoppippi.com'
				mya
				target='_blank'
			>
				source code
			</a>
		</div>
	</nav>
</header>

<style>
a{
	--uno: no-underline;
}
</style>

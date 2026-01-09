<script lang='ts'>
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import * as ufo from 'ufo';

	const { size = 4.5 } = $props();

	const ICONS = ([
		{ class: 'i-line-md:github-loop', url: '/github' },
		{ class: 'i-ph-git-pull-request-duotone', url: '/pr' },
		{ class: 'i-line-md:linkedin', url: '/linkedin' },
		{ class: 'i-line-md:twitter', url: '/twitter' },
		{ class: 'i-simple-icons:bluesky', url: '/bsky' },
		{ class: 'i-ri:youtube-line', url: '/youtube' },
	] as const)
		.map(({ url, ...rest }) => ({
			url: ufo.joinURL(PUBLIC_ORIGIN, url),
			...rest,
		}));
</script>

<article
	animate='duration-3000 keyframes-fade-in'
	gap-3
	gcc
	grid-cols='3 sm:7'
>
	{#each ICONS as { class: _class, url } (url)}
		{@const { pathname } = ufo.parseURL(url)}
		{@const path = pathname.replace('/', '')}
		<div
			cursor-pointer
			hover='scale-110 shadow-xl z-10 bg-[#88888811] op100'
			op-card
			transition-base
		>
			<a aria-label="link to ryoppippi's {path}" href={url} rel='noopener noreferrer' target='_blank'>
				<!-- svelte-ignore element_invalid_self_closing_tag -->
				<div
					style:--size='{size}vh'
					class={_class}
					text-size='[--size]'
				/>
			</a>
		</div>
	{/each}
</article>

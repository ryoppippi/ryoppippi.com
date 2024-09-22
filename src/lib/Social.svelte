<script lang='ts'>
	import * as ufo from 'ufo';

	const { size = 4.5 } = $props();

	const ICONS = ([
		{ class: 'i-line-md:github-loop', url: '/github' },
		{ class: 'i-ph-git-pull-request-duotone', url: '/pr' },
		{ class: 'i-simple-icons:zenn', url: '/zenn' },
		{ class: 'i-line-md:linkedin', url: '/linkedin' },
		{ class: 'i-line-md:twitter', url: '/twitter' },
		{ class: 'i-simple-icons:bluesky', url: '/bsky' },
		// { class: 'i-line-md:reddit-loop', url: '/reddit' },
		{ class: 'i-ri:youtube-line', url: '/youtube' },
	] as const)
		// @ts-expect-error url is required
		// eslint-disable-next-line node/prefer-global/process
		.map(({ url, ...rest }) => ({ url: ufo.joinURL(process.env.DOMAIN, url), ...rest }));
</script>

<article
	animate='duration-3000 keyframes-fade-in'
	gap-3
	grid='~ cols-3 sm:cols-7'
	place-items-center
>
	{#each ICONS as { class: _class, url } (url)}
		{@const { pathname } = ufo.parseURL(url)}
		{@const path = pathname.replace('/', '')}
		<div cursor-pointer op='hover:75'>
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

<script lang='ts'>
	import { fade } from 'svelte/transition';
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
	gap-3
	grid='~ cols-3 sm:cols-7'
	place-items-center
	in:fade|global={{ duration: 3000 }}>
	{#each ICONS as { class: _class, url } (url)}
		{@const { pathname } = ufo.parseURL(url)}
		{@const path = pathname.replace('/', '')}
		<div class='animation' cursor-pointer>
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

<style>
	.animation:hover {
		animation: rotate 4s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite both;
	}

	@keyframes rotate {
		0% {
			transform: scale(1) rotateZ(0);
		}
		25% {
			transform: scale(1.3) rotateZ(30deg);
		}
		50% {
			transform: scale(1) rotateZ(0);
		}
		75% {
			transform: scale(1.3) rotateZ(-30deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.animation:hover {
			animation: none;
		}
	}
</style>

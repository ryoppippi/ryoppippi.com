<script lang='ts'>
	import { fade } from 'svelte/transition';
	import { parseURL } from 'ufo';

	const { size = 4.5 } = $props();

	const ICONS = [
		{ class: 'i-line-md:github-loop', url: 'https://github.com/ryoppippi' },
		{ class: 'i-simple-icons:zenn', url: 'https://zenn.dev/ryoppippi' },
		{ class: 'i-line-md:linkedin', url: 'https://www.linkedin.com/in/ryoppippi/' },
		{ class: 'i-line-md:twitter', url: 'https://x.com/ryoppippi' },
		{ class: 'i-simple-icons:bluesky', url: 'https://bsky.app/profile/ryoppippi.com' },
		{ class: 'i-line-md:reddit-loop', url: 'https://www.reddit.com/user/ryoppippi' },
		{ class: 'i-ri:youtube-line', url: 'https://www.youtube.com/channel/UCJbUM-yZx6mESJw82-OpMuQ' },
	] as const;
</script>

<article
	gap-3
	grid='~ cols-3 sm:cols-7'
	place-items-center
	in:fade|global={{ duration: 3000 }}>
	{#each ICONS as { class: _class, url } (url)}
		{@const { host } = parseURL(url)}
		<div class='animation' cursor-pointer>
			<a aria-label="link to ryoppippi's {host}" href={url} rel='noopener noreferrer' target='_blank'>
				<!-- svelte-ignore element_invalid_self_closing_tag -->
				<div style:font-size='{size}vh' class={_class} />
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
</style>

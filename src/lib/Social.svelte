<script lang='ts'>
	import { fade } from 'svelte/transition';
	import { parseURL } from 'ufo';

	import IconGithub from '~icons/line-md/github-loop';
	import IconZenn from '~icons/simple-icons/zenn';
	import IconLinkedin from '~icons/line-md/linkedin';
	import IconTwitter from '~icons/line-md/twitter';
	import IconReddit from '~icons/line-md/reddit-loop';
	import IconYoutube from '~icons/ri/youtube-line';
	import IconBluesky from '~icons/simple-icons/bluesky';

	const { size = 4.5 } = $props();

	const ICONS = [
		{ component: IconGithub, url: 'https://github.com/ryoppippi' },
		{ component: IconZenn, url: 'https://zenn.dev/ryoppippi' },
		{ component: IconLinkedin, url: 'https://www.linkedin.com/in/ryoppippi/' },
		{ component: IconTwitter, url: 'https://twitter.com/ryoppippi' },
		{ component: IconBluesky, url: 'https://bsky.app/profile/ryoppippi.com' },
		{ component: IconReddit, url: 'https://www.reddit.com/user/ryoppippi' },
		{ component: IconYoutube, url: 'https://www.youtube.com/channel/UCJbUM-yZx6mESJw82-OpMuQ' },
	] as const;
</script>

<article class='grid grid-cols-3 place-items-center gap-3 sm:grid-cols-7' in:fade|global={{ duration: 3000 }}>
	{#each ICONS as { component, url } (url)}
		{@const { host } = parseURL(url)}
		<div class='animation cursor-pointer'>
			<a aria-label="link to ryoppippi's {host}" href={url} rel='noopener noreferrer' target='_blank'>
				<svelte:component this={component} style='font-size: {size}vh' />
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

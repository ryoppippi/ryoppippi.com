<script>
	/** @type {number} */
	export let size = 4.5;

	import Icon from '@iconify/svelte';
	import { fade } from 'svelte/transition';

	const ICONS = [
		{ name: 'line-md:github-loop', url: 'https://github.com/ryoppippi' },
		{ name: 'simple-icons:zenn', url: 'https://zenn.dev/ryoppippi' },
		{ name: 'line-md:linkedin', url: 'https://www.linkedin.com/in/ryoppippi/' },
		{ name: 'line-md:twitter', url: 'https://twitter.com/ryoppippi' },
		{ name: 'line-md:reddit-loop', url: 'https://www.reddit.com/user/ryoppippi' },
		{ name: 'ri:youtube-line', url: 'https://www.youtube.com/channel/UCJbUM-yZx6mESJw82-OpMuQ' }
	];
</script>

<article class="container mx-auto flex h-full items-center justify-center gap-3" in:fade={{ duration: 3000 }}>
	{#each ICONS as icon}
		{@const { name, url } = icon}
		<div>
			<a href={url} target="_blank" rel="noopener noreferrer">
				<Icon title={url} icon={name} aria-label="link to {url}" style="font-size: {size}vh" />
			</a>
		</div>
	{/each}
</article>

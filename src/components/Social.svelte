<script lang='ts'>
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import * as ufo from 'ufo';
	import GithubLoop from '~icons/line-md/github-loop';
	import Linkedin from '~icons/line-md/linkedin';
	import Twitter from '~icons/line-md/twitter';
	import GitPullRequest from '~icons/ph/git-pull-request-duotone';
	import Youtube from '~icons/ri/youtube-line';
	import Bluesky from '~icons/simple-icons/bluesky';

	const { size = 4.5 } = $props();

	const ICONS = ([
		{ Icon: GithubLoop, label: 'GitHub profile', url: '/github' },
		{ Icon: GitPullRequest, label: 'Recent pull requests', url: '/pr' },
		{ Icon: Linkedin, label: 'LinkedIn profile', url: '/linkedin' },
		{ Icon: Twitter, label: 'Twitter profile', url: '/twitter' },
		{ Icon: Bluesky, label: 'Bluesky profile', url: '/bsky' },
		{ Icon: Youtube, label: 'YouTube channel', url: '/youtube' },
	] as const)
		.map(({ url, ...rest }) => ({
			url: ufo.joinURL(PUBLIC_ORIGIN, url),
			...rest,
		}));
</script>

<article
	style:--cols={ICONS.length}
	class='gcc animate-[fade-in_3s_both] grid-cols-3 gap-3 sm:grid-cols-[repeat(var(--cols),minmax(0,1fr))]'
>
	{#each ICONS as { Icon, label, url } (url)}
		<div class='op-card transition-base hover:z-10 hover:scale-110 hover:bg-[#88888811] hover:opacity-100 hover:shadow-xl'
		>
			<a aria-label={label} href={url} rel='noopener noreferrer' target='_blank'>
				<Icon
					style={`--size: ${size}vh`}
					class='text-[length:var(--size)]'
					aria-hidden='true'
				/>
			</a>
		</div>
	{/each}
</article>

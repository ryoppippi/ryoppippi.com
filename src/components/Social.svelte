<script lang='ts'>
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import * as ufo from 'ufo';

	const { size = 4.5 } = $props();

	const ICONS = ([
		{ class: 'i-line-md:github-loop', label: 'GitHub profile', url: '/github' },
		{ class: 'i-ph-git-pull-request-duotone', label: 'Recent pull requests', url: '/pr' },
		{ class: 'i-line-md:linkedin', label: 'LinkedIn profile', url: '/linkedin' },
		{ class: 'i-line-md:twitter', label: 'Twitter profile', url: '/twitter' },
		{ class: 'i-simple-icons:bluesky', label: 'Bluesky profile', url: '/bsky' },
		{ class: 'i-ri:youtube-line', label: 'YouTube channel', url: '/youtube' },
	] as const)
		.map(({ url, ...rest }) => ({
			url: ufo.joinURL(PUBLIC_ORIGIN, url),
			...rest,
		}));
</script>

<article
	style:--cols={ICONS.length}
	animate='duration-3000 keyframes-fade-in'
	gap-3
	gcc
	grid-cols-3
	sm:grid-cols='[repeat(var(--cols),minmax(0,1fr))]'
>
	{#each ICONS as { class: _class, label, url } (url)}
		<div
			hover='scale-110 shadow-xl z-10 bg-[#88888811] op100'
			op-card
			transition-base
		>
			<a aria-label={label} href={url} rel='noopener noreferrer' target='_blank'>
				<!-- svelte-ignore element_invalid_self_closing_tag -->
				<div
					style:--size='{size}vh'
					class={_class}
					aria-hidden='true'
					text-size='[--size]'
				/>
			</a>
		</div>
	{/each}
</article>

<script lang='ts'>
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import * as ufo from 'ufo';

	const { size = 4.5 } = $props();

	const ICONS = ([
		{ class: 'icon-[line-md--github-loop]', label: 'GitHub profile', url: '/github' },
		{ class: 'icon-[ph--git-pull-request-duotone]', label: 'Recent pull requests', url: '/pr' },
		{ class: 'icon-[line-md--linkedin]', label: 'LinkedIn profile', url: '/linkedin' },
		{ class: 'icon-[line-md--twitter]', label: 'Twitter profile', url: '/twitter' },
		{ class: 'icon-[simple-icons--bluesky]', label: 'Bluesky profile', url: '/bsky' },
		{ class: 'icon-[ri--youtube-line]', label: 'YouTube channel', url: '/youtube' },
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
	{#each ICONS as { class: _class, label, url } (url)}
		<div class='op-card transition-base hover:z-10 hover:scale-110 hover:bg-[#88888811] hover:opacity-100 hover:shadow-xl'
		>
			<a aria-label={label} href={url} rel='noopener noreferrer' target='_blank'>
				<!-- svelte-ignore element_invalid_self_closing_tag -->
				<div
					style:--size='{size}vh'
					class={[_class, 'text-[length:var(--size)]']}
					aria-hidden='true'
				/>
			</a>
		</div>
	{/each}
</article>

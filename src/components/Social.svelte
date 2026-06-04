<script lang='ts'>
	import Icon from '$components/Icon.svelte';
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import * as ufo from 'ufo';

	const { size = 4.5 } = $props();

	const ICONS = ([
		{ icon: 'icon-[line-md--github-loop]', label: 'GitHub profile', url: '/github' },
		{ icon: 'icon-[ph--git-pull-request-duotone]', label: 'Recent pull requests', url: '/pr' },
		{ icon: 'icon-[line-md--linkedin]', label: 'LinkedIn profile', url: '/linkedin' },
		{ icon: 'icon-[line-md--twitter]', label: 'Twitter profile', url: '/twitter' },
		{ icon: 'icon-[simple-icons--bluesky]', label: 'Bluesky profile', url: '/bsky' },
		{ icon: 'icon-[ri--youtube-line]', label: 'YouTube channel', url: '/youtube' },
	] as const)
		.map(({ url, ...rest }) => ({
			url: ufo.joinURL(PUBLIC_ORIGIN, url),
			...rest,
		}));
</script>

<article
	style:--cols={ICONS.length}
	class={[
		'gcc',
		'animate-[root-fade-in_3s_both]',
		['grid-cols-3', 'sm:grid-cols-[repeat(var(--cols),minmax(0,1fr))]'],
		'gap-3',
	]}
>
	{#each ICONS as { icon, label, url } (url)}
		<div
			class={[
				'op-card',
				'transition-base',
				['hover:z-10', 'hover:scale-110'],
				['hover:bg-[#88888811]'],
				['hover:opacity-100', 'hover:shadow-xl'],
			]}
		>
			<a aria-label={label} href={url} rel='noopener noreferrer' target='_blank'>
				<Icon
					style={`--size: ${size}vh`}
					class={[
						icon,
						'text-[length:var(--size)]',
					]}
					aria-hidden='true'
				/>
			</a>
		</div>
	{/each}
</article>

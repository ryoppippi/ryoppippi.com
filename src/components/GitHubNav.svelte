<script lang='ts'>
	import Icon from '$components/Icon.svelte';
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import * as ufo from 'ufo';
</script>

{#snippet link(
	_subdomain: string,
	icon: string,
	color: `btn-${string}`,
	name: string
)}
	<a
		class={[color, 'fcol-md-row fyc gap-1']}
		href={ufo.joinURL(PUBLIC_ORIGIN, _subdomain)}
		rel='noopener noreferrer'
		target='_blank'
	>
		<Icon class={icon} aria-hidden='true' /> {name}
	</a>
{/snippet}

<div class='prose mx-auto mt-10 pb-5 dark:prose-invert'
>
	<div class='fxc gap-2'>
		{@render link('/pr', 'icon-[ph--git-pull-request-duotone]', 'btn-green', 'My Recent PRs')}
		{@render link('/gh', 'icon-[ph--github-logo-duotone]', 'btn-blue', 'GitHub')}
		{@render link('/gh-by-stars', 'icon-[ph--star]', 'btn-pink', 'Sort by Stars')}
	</div>

</div>

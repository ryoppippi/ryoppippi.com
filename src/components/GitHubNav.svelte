<script lang='ts'>
	import type { Component } from 'svelte';
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import * as ufo from 'ufo';
	import GitPullRequest from '~icons/ph/git-pull-request-duotone';
	import GithubLogo from '~icons/ph/github-logo-duotone';
	import Star from '~icons/ph/star';
</script>

{#snippet link(
	_subdomain: string,
	Icon: Component,
	color: `btn-${string}`,
	name: string
)}
	<a
		class={[color, 'fcol-md-row fyc gap-1']}
		href={ufo.joinURL(PUBLIC_ORIGIN, _subdomain)}
		rel='noopener noreferrer'
		target='_blank'
	>
		<Icon aria-hidden='true' /> {name}
	</a>
{/snippet}

<div class='prose mx-auto mt-10 pb-5 dark:prose-invert'
>
	<div class='fxc gap-2'>
		{@render link('/pr', GitPullRequest, 'btn-green', 'My Recent PRs')}
		{@render link('/gh', GithubLogo, 'btn-blue', 'GitHub')}
		{@render link('/gh-by-stars', Star, 'btn-pink', 'Sort by Stars')}
	</div>

</div>

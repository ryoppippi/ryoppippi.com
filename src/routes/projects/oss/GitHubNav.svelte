<script lang='ts'>
	import { subdomain } from '$lib/util';
</script>

{#snippet link(
	_subdomain: string,
	icon: string,
	color: `btn-${string}`,
	name: string
)}
		<a
			class={color}
			fcol-md-row
			fyc
			href={subdomain(_subdomain)}
			target='_blank'
		>
			<!-- svelte-ignore element_invalid_self_closing_tag -->
			<span class={icon} /> {name}
		</a>
{/snippet}

<div
	mt10
	mxa
	pb5
	prose-base
>
	<div fxc gap-2>
		{@render link('/pr', 'i-ph-git-pull-request-duotone', 'btn-green', 'My Recent PRs')}
		{@render link('/gh', 'i-ph-github-logo-duotone', 'btn-blue', 'GitHub')}
		{@render link('/gh-by-stars', 'i-ph-star', 'btn-pink', 'Sort by Stars')}
	</div>

</div>

<script>
	import { subdomain } from '$lib/util';
</script>

<div
	mt10
	mxa
	pb5
	prose='~ dark:invert'
>
	<div fxc gap-2>
		<a
			btn-green
			fcol-md-r
			fyc
			href={subdomain('/pr')}
			target='_blank'
		>
			<!-- svelte-ignore element_invalid_self_closing_tag -->
			<span i-ph-git-pull-request-duotone /> My Recent PRs
		</a>
		<a
			btn-blue
			fcol-md-r
			fyc
			href={subdomain('/gh')}
			target='_blank'
		>
			<!-- svelte-ignore element_invalid_self_closing_tag -->
			<span i-ph-github-logo-duotone /> GitHub
		</a>
		<a
			btn-pink
			fcol-md-r
			fyc
			href={subdomain('/gh-by-stars')}
			target='_blank'
		>
			<!-- svelte-ignore element_invalid_self_closing_tag -->
			<span i-ph-star /> Sort by Stars
		</a>
	</div>

</div>

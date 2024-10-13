<script lang='ts'>
	import { capitalize, lowercase } from '@ryoppippi/str-fns';

	const { routes, url }: { routes: string[]; url: URL } = $props();
</script>
<div
	fcol-sm-row
	fw
	gap='1 sm:3'
	mb-8
	text-3xl
>
	{#each routes as route (route)}
		{@const lowercaseRoute = lowercase(route)}
		{@const isCurrent = url.pathname.endsWith(lowercaseRoute)}
		<a
			style:--nav-title='project-nav-{route}'
			style:view-transition-name='project-nav-{route}'
			class:op70={isCurrent}
			href={isCurrent ? null : `./${lowercaseRoute}`}
			op20
		>{capitalize(route)}
		</a>
	{/each}
</div>

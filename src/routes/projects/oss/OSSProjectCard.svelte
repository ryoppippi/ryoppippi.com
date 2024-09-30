<script lang='ts'>
	import type { Project } from '$contents/projects/oss/types';

	const { project }: { project: Project } = $props();
	const { name, description, icon, link, slug } = project;
</script>

<!-- eslint-disable-next-line svelte/require-each-key -->
<!-- card conmponrnt -->
<a
	font-sans
	grid='~ cols-5'
	hover='scale-101 shadow-xl z-10 bg-[#88888811]'
	href={link}
	max-w-full
	no-underline
	op-card
	select-none
	target='_blank'
	transition-base
>
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<div
		style:view-transition-name={slug}
		gcc
	>
		<div class={icon} op50 text-3xl />
	</div>
	<div
		fcol
		grid-col-span-4
	>
		<div text-lg truncate>
			{name}
		</div>
		<p h-8 line-clamp-2 text-xs>
			{description ?? ''}
		</p>
	</div>
</a>

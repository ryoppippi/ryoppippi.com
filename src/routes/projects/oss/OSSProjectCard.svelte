<script lang='ts'>
	import type { Project } from '$contents/projects/oss/types';

	const { project }: { project: Project } = $props();
	const { name, description, icon, link } = project;
</script>

<!-- eslint-disable-next-line svelte/require-each-key -->
<!-- card conmponrnt -->
<a
	bg='hover:[#88888811]'
	font-sans
	grid='~ cols-5'
	href={link}
	max-w-full
	no-underline
	op-card
	select-none
	target='_blank'
	transition
>
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<div
		style:--project-title={name}
		gcc
		view-transition='-[--project-title]'
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

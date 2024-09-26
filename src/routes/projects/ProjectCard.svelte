<script lang='ts'>
	import type { Project } from './oss-projects';

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
	op='70 dark:50 hover:80'
	target='_blank'
	transition
>
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<div
		style:--project-title={name}
		grid
		place-content-center
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
		<p line-clamp-2 text-xs>
			{description ?? ''}
		</p>
	</div>

</a>

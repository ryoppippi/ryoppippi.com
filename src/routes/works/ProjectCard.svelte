<script lang='ts'>
	import type { Project } from './projects';

	const { project }: { project: Project } = $props();
	const { name, description, icon, link } = project;
</script>

<div prose='~ dark:invert'>
	<!-- eslint-disable-next-line svelte/require-each-key -->
	<!-- card conmponrnt -->
	<a
		grid='~ cols-3'
		href={link}
		no-underline
		op='70 hover:100'
		target='_blank'
		transition
	>
		<!-- svelte-ignore element_invalid_self_closing_tag -->
		<div
			grid
			op50
			place-content-center
		>
			<div class={icon} op50 text-3xl />
		</div>
		<div
			fcol
			grid-col-span-2
			op50
		>
			<div text-lg>
				{name}
			</div>
			<p text-sm>
				{description ?? ''}
			</p>
		</div>

	</a>
</div>

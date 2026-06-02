<script lang='ts'>
	import type { Project } from '$contents/works/oss/types';

	const { project }: { project: typeof Project.infer } = $props();
	const { name, description, icon, link, slug } = project;
</script>

<a
	class='grid max-w-full select-none grid-cols-5 font-sans no-underline op-card transition-base hover:z-10 hover:scale-[1.01] hover:bg-[#88888811] hover:shadow-xl'
	href={link}
	rel='noopener noreferrer'
	target='_blank'
>
	<div
		style:view-transition-name={slug}
		class='gcc'
		aria-hidden='true'
	>
		<!-- svelte-ignore element_invalid_self_closing_tag -->
		<div class={[icon, 'text-3xl opacity-50']} />
	</div>
	<div class='fcol col-span-4'>
		<div class='truncate text-lg'>
			{name}
		</div>
		<p class='h-8 line-clamp-2 text-xs'>
			{description ?? ''}
		</p>
	</div>
</a>

<script lang='ts'>
	type Props = {
		title: string;
		level?: 1 | 2;
		viewTransitionName?: string;
		selectDisabled?: boolean;
		opacity?: boolean;
	};
	const {
		title,
		level = 1,
		viewTransitionName,
		selectDisabled = false,
		opacity = true,
	}: Props = $props();

	const tag = $derived(`h${level}` as const);
</script>

<svelte:element
	this={tag}
	style:view-transition-name={viewTransitionName}
	class={{ 'op-35 dark:op-20': opacity, 'select-none': selectDisabled }}
	f-text-32-64
	font='mono bold'
	line-height-none
	my-8
	text-stroke='hex-aaa [1.5px]'
	text-transparent
>
	{title}
</svelte:element>

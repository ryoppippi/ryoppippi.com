<script lang='ts'>
	type Props = {
		title: string;
		viewTransitionName?: string;
		selectDisabled?: boolean;
		opacity?: boolean;
	};
	const {
		title,
		viewTransitionName,
		selectDisabled = false,
		opacity = true,
	}: Props = $props();
</script>

<h1
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
</h1>

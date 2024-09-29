<script lang='ts'>
	type Props = {
		title: string;
		viewTransitionName?: string;
		selectDisabled?: boolean;
	};
	const {
		title,
		viewTransitionName,
		selectDisabled = false,
	}: Props = $props();
</script>

<h1
	style:view-transition-name={viewTransitionName}
	class:select-none={selectDisabled}
	f-text-32-64
	font='mono bold'
	line-height-none
	op='35 dark:20'
	py-8
	text-stroke='hex-aaa [1.5px]'
	text-transparent
>
	{title}
</h1>

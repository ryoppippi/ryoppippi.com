<script lang='ts'>
	type Props = {
		title: string;
		viewTransitionName?: string;
	};
	const { title, viewTransitionName }: Props = $props();
</script>

<h1
	style:view-transition-name={viewTransitionName}
	f-text-32-64
	font='mono bold'
	line-height-none
	op='35 dark:20'
	py-8
	select-none
	text-stroke='hex-aaa [1.5px]'
	text-transparent
>
	{title}
</h1>

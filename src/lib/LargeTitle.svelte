<script lang='ts'>
	const { title }: { title: string } = $props();
</script>

<h2
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
</h2>

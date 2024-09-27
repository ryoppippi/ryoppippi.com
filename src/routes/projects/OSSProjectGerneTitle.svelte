<script lang='ts'>
	type Props = { genre: string };
	const { genre }: Props = $props();
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
	{genre}

</h2>

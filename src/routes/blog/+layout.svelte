<script>
	const { children } = $props();
</script>
<div
	container
	grid
	mt-8
	mx='md:a'
	place-content-center
>
	{@render children()}
</div>

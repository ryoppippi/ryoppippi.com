<script lang='ts'>
	const name = `ryoppippi`;

	import img from '$lib/assets/ryoppippi.png?enhanced';
</script>

<div>
	<enhanced:img
		style:--tag={name}
		class='object-fit mx-auto aspect-square w-1/2 rounded-full md:h-64 md:w-64'
		alt='profile'
		src={img} />
</div>

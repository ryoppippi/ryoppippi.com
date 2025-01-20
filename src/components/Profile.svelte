<script lang='ts'>
	import Image from './Image.svelte';
</script>

<div>
	<Image
		class='object-contain mx-auto aspect-square w-1/2 rounded-full md:size-64 view-transition-name---profile'
		alt='profile'
		fetchpriority='high'
		loading='eager'
		src='/src/lib/assets/ryoppippi.jpg'
	/>
</div>

<script lang='ts'>
	import Image from './Image.svelte';
</script>

<div>
	<Image
		class='object-contain mx-auto aspect-square w-1/2 rounded-full md:(h-64 w-64)'
		alt='profile'
		loading='eager'
		src='/src/lib/assets/ryoppippi.png'
	/>
</div>

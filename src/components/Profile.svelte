<script lang='ts'>
	import ryoppippi from '../lib/assets/ryoppippi.jpg?enhanced&w=400';
	import Image from './Image.svelte';
</script>

<div>
	<Image
		class='mx-auto aspect-square w-1/2 rounded-full object-contain view-transition-name---profile md:size-64'
		alt='profile'
		fetchpriority='high'
		loading='eager'
		src={ryoppippi}
	/>
</div>

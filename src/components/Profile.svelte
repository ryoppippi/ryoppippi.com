<script lang='ts'>
	import { asset } from '$app/paths';
	import Image from './Image.svelte';
</script>

<div>
	<Image
		class='mx-auto aspect-square w-1/2 rounded-full object-contain view-transition-name---profile md:size-64'
		alt='profile'
		fetchpriority='high'
		loading='eager'
		src={asset('/ryoppippi.avif')}
	/>
</div>

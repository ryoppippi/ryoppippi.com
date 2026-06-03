<script lang='ts'>
	import { asset } from '$app/paths';
	import Image from './Image.svelte';
</script>

<div>
	<Image
		class={[
			'mx-auto',
			['aspect-square', 'w-1/2', 'md:size-64'],
			'rounded-full',
			'object-contain',
			'view-transition-name---profile',
		]}
		alt='ryoppippi profile photo'
		fetchpriority='high'
		loading='eager'
		src={asset('/ryoppippi.avif')}
	/>
</div>

<script lang='ts'>
	import type { HTMLImgAttributes } from 'svelte/elements';

	type Props = {
		src: string;
		alt: string;
	} & HTMLImgAttributes;

	const { src, alt, class: className, ...rest }: Props = $props();
</script>

<img
	class={className}
	{alt}
	loading='lazy'
	{src}
	{...rest}
/>

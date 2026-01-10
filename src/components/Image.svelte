<script lang='ts'>
	type EnhancedImg = typeof import('*.png?enhanced').default;

	type Props = {
		src: string | EnhancedImg;
		alt: string;
	} & { [key: string]: unknown };

	const { src, alt, ...rest }: Props = $props();

	function isEnhancedImg(src: string | EnhancedImg): src is EnhancedImg {
		return typeof src === 'object' && src !== null;
	}
</script>

{#if isEnhancedImg(src)}
	<enhanced:img
		{alt}
		loading='lazy'
		{src}
		{...rest}
	/>
{:else}
	<img
		{alt}
		loading='lazy'
		{src}
		{...rest}
	/>
{/if}

<script lang='ts'>
	type EnhancedImg = typeof import('*.png?enhanced').default;

	type Props = {
		src: string;
		alt: string;
	} & { [key: string]: unknown };

	const { src, alt, ...rest }: Props = $props();

	function importImage(src: string): EnhancedImg {
		const pictures = import.meta.glob(`/src/**/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}`, {
			import: 'default',
			query: {
				enhanced: true,
				w: '2400;2000;1600;1200;800;400',
			},
			eager: true,
		});

		for (const [path, picutureSrc] of Object.entries(pictures)) {
			if (path.includes(src) || src.includes(path)) {
				return picutureSrc as EnhancedImg;
			}
		}
		throw new Error(`Image not found: ${src}`);
	}
</script>

{#if src.startsWith('http')}
	<img
		{...rest}
		{alt}
		loading='lazy'
		{src}
	/>
{:else}
	<enhanced:img
		{alt}
		{...rest}
		loading='lazy'
		src={importImage(src)}
	/>
{/if}

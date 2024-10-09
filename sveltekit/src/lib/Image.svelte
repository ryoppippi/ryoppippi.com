<script lang='ts'>
	type EnhancedImg = typeof import('*.png?enhanced').default;

	type Props = {
		src: string;
		alt: string;
	} & { [key: string]: unknown };

	const { src, alt, ...rest }: Props = $props();

	function importImage(src: string): EnhancedImg | undefined {
		const pictures = import.meta.glob(`/src/**/*.{gif,heif,jpeg,jpg,png,tiff,webp}`, {
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
		return undefined;
	}
</script>

{#snippet img(src: string)}
	<img
		{alt}
		loading='lazy'
		{src}
		{...rest}
	/>
{/snippet}

{#if src.startsWith('http')}
	{@render img(src)}
{:else}
	{@const enhancedSrc = importImage(src)}
	{#if enhancedSrc != null}
		<enhanced:img
			{alt}
			loading='lazy'
			src={enhancedSrc}
			{...rest}
		/>
	{:else}
		{@render img(src)}
	{/if}
{/if}

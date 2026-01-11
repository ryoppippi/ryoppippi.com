<script lang='ts'>
	type Props = {
		src: string;
		alt: string;
	} & { [key: string]: unknown };

	const { src, alt, ...rest }: Props = $props();
</script>

<img
	{alt}
	loading='lazy'
	{src}
	{...rest}
/>

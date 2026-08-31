type ProfileImageProps = {
	class: string;
	fetchpriority?: 'high' | 'low' | 'auto';
};

/**
 * Renders the responsive site-owner portrait shared across profile surfaces.
 *
 * @param props - Page-specific presentation and optional fetch priority.
 * @returns The shared responsive portrait image.
 */
export default function ProfileImage(props: ProfileImageProps) {
	return (
		<img
			class={props.class}
			alt="ryoppippi"
			decoding="async"
			fetchpriority={props.fetchpriority}
			height="400"
			loading="eager"
			src="/ryoppippi.avif"
			srcset="/ryoppippi-174.avif 174w, /ryoppippi-348.avif 348w, /ryoppippi.avif 400w"
			sizes="(min-width: 48rem) 256px, calc(50vw - 2rem)"
			width="400"
		/>
	);
}

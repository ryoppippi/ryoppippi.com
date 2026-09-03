import styles from './Sponsors.module.css';

/**
 * Renders the sponsor acknowledgements and controls.
 *
 * @returns The sponsors page fragment.
 */
export default function SponsorsPage() {
	return (
		<div class={styles.sponsorsPage}>
			<h1 class={`${styles.sponsorsTitle} ${styles.visuallyHidden}`}>Sponsors</h1>
			<p class={styles.sponsorsMessage}>
				Thank you to everyone supporting my work—it keeps the OSS, blog, and talks alive.
			</p>
			<p>
				<a
					class={styles.sponsorsLink}
					href="https://github.com/sponsors/ryoppippi"
					rel="noreferrer"
					target="_blank"
				>
					<span class="icon-[ph--heart]" aria-hidden="true" />
					GitHub Sponsors
				</a>
			</p>
			<button
				class={styles.sponsorsToggle}
				aria-controls="sponsor-image"
				aria-describedby="sponsor-view-status"
				data-sponsor-view="circles"
				type="button"
			>
				Show Sponsor Tiers
			</button>
			<span id="sponsor-view-status" class={styles.visuallyHidden} aria-live="polite">
				Showing Sponsor Circles
			</span>
			<div class={styles.sponsorsImageFrame}>
				<img
					id="sponsor-image"
					class={styles.sponsorsImage}
					alt="GitHub Sponsors"
					data-sponsor-image
					decoding="async"
					loading="lazy"
					src="https://sponsors.ryoppippi.com/sponsors.circles.svg"
				/>
			</div>
		</div>
	);
}

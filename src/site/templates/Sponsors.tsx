/**
 * Renders the sponsor acknowledgements and controls.
 *
 * @returns The sponsors page fragment.
 */
export default function Sponsors() {
	return (
		<div class="fcol container mx-auto gap-8 py-8">
			<h1 class="sr-only">Sponsors</h1>
			<p class="op-card">
				Thank you to everyone supporting my work—it keeps the OSS, blog, and talks alive.
			</p>
			<p>
				<a
					class="inline-flex items-center gap-2 btn-pink"
					href="https://github.com/sponsors/ryoppippi"
					rel="noreferrer"
					target="_blank"
				>
					<span class="icon-[ph--heart]" aria-hidden="true" />
					GitHub Sponsors
				</a>
			</p>
			<button
				class="mx-auto cursor-pointer border-none bg-transparent p-0 text-2xl text-text-100 opacity-70 transition-base hover:opacity-100"
				aria-controls="sponsor-image"
				aria-describedby="sponsor-view-status"
				data-sponsor-view="circles"
				type="button"
			>
				Show Sponsor Tiers
			</button>
			<span id="sponsor-view-status" class="sr-only" aria-live="polite">
				Showing Sponsor Circles
			</span>
			<div class="fyc">
				<img
					id="sponsor-image"
					class="mx-auto h-auto w-full max-w-5xl"
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

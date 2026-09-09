/** IntersectionObserver tuning for the chart's entrance animation. */
export type ScrollRevealOptions = { rootMargin?: string };

/** Reactive reveal state and its observer lifecycle. */
export type ScrollReveal = {
	readonly revealed: boolean;
	readonly attach: (node: HTMLElement) => (() => void) | undefined;
};

/**
 * Tracks visibility without hiding server-rendered chart content.
 *
 * The server starts in the finished state. Only an off-screen client island
 * rewinds the animation; visible charts and reduced-motion readers stay revealed.
 *
 * @param options - Observer tuning; rootMargin defaults to '-10% 0px'.
 * @returns Reactive reveal state and an attach function returning observer cleanup.
 * @example
 * const reveal = createScrollReveal();
 * onMount(() => reveal.attach(figure));
 */
export function createScrollReveal(options: ScrollRevealOptions = {}): ScrollReveal {
	const { rootMargin = '-10% 0px' } = options;
	let revealed = $state(true);

	function attach(node: HTMLElement) {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const box = node.getBoundingClientRect();
		if (box.top < window.innerHeight && box.bottom > 0) return;

		revealed = false;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					revealed = true;
					observer.disconnect();
				}
			},
			{ rootMargin },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}

	return {
		get revealed() {
			return revealed;
		},
		attach,
	};
}

import type { Accessor } from 'solid-js';
import { createSignal } from 'solid-js';

export type ScrollRevealOptions = {
	/**
	 * `rootMargin` for the underlying `IntersectionObserver`.
	 *
	 * @default '-10% 0px'
	 */
	rootMargin?: string;
};

export type ScrollReveal = {
	/** Whether the element has been revealed. */
	readonly revealed: Accessor<boolean>;
	/**
	 * Attaches the reveal to the element, from `onMount` so the element has its
	 * real geometry. Returns the observer cleanup when one was started.
	 */
	readonly attach: (node: HTMLElement) => (() => void) | undefined;
};

/**
 * Tracks whether an element has been scrolled into view, for entrance
 * animations that must not break server-rendered output.
 *
 * `revealed` starts `true` so the server-rendered markup is the finished state.
 * On the client it is rewound only while the element is off screen, then flipped
 * back when the element scrolls in. Elements already visible when the island
 * mounts, and readers who prefer reduced motion, are left alone.
 *
 * @param options - Observer tuning.
 * @returns The reveal state and the attach function that drives it.
 * @example
 * ```tsx
 * const reveal = createScrollReveal();
 * let node!: HTMLElement;
 * onMount(() => {
 * 	const cleanup = reveal.attach(node);
 * 	if (cleanup != null) {
 * 		onCleanup(cleanup);
 * 	}
 * });
 * <figure ref={node} classList={{ revealed: reveal.revealed() }}>...</figure>
 * ```
 */
export function createScrollReveal(options: ScrollRevealOptions = {}): ScrollReveal {
	const { rootMargin = '-10% 0px' } = options;
	const [revealed, setRevealed] = createSignal(true);

	function attach(node: HTMLElement) {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return;
		}

		const box = node.getBoundingClientRect();
		const onScreen = box.top < window.innerHeight && box.bottom > 0;
		if (onScreen) {
			return;
		}

		setRevealed(false);
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					setRevealed(true);
					observer.disconnect();
				}
			},
			{ rootMargin },
		);
		observer.observe(node);

		return () => observer.disconnect();
	}

	return { revealed, attach };
}

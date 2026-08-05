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
	readonly revealed: boolean;
	/** Attachment to spread onto the element that should trigger the reveal. */
	readonly attach: (node: HTMLElement) => (() => void) | undefined;
};

/**
 * Tracks whether an element has been scrolled into view, for entrance
 * animations that must not break server-rendered output.
 *
 * `revealed` starts `true` so the server-rendered markup is the finished state.
 * On the client it is rewound only while the element is off screen, then flipped
 * back when the element scrolls in. Elements already visible at hydration, and
 * readers who prefer reduced motion, are left alone.
 *
 * @param options - Observer tuning.
 * @returns The reveal state and the attachment that drives it.
 * @example
 * ```svelte
 * const reveal = createScrollReveal();
 * const opacity = $derived(reveal.revealed ? 1 : 0);
 * <figure style:opacity {@attach reveal.attach}>...</figure>
 * ```
 */
export function createScrollReveal(options: ScrollRevealOptions = {}): ScrollReveal {
	const { rootMargin = '-10% 0px' } = options;
	let revealed = $state(true);

	function attach(node: HTMLElement) {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return;
		}

		const box = node.getBoundingClientRect();
		const onScreen = box.top < window.innerHeight && box.bottom > 0;
		if (onScreen) {
			return;
		}

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

if (import.meta.vitest != null) {
	describe(createScrollReveal, () => {
		beforeEach(() => {
			document.body.replaceChildren();
			window.scrollTo(0, 0);
		});

		it('starts revealed so server-rendered markup is the finished state', () => {
			expect(createScrollReveal().revealed).toBe(true);
		});

		it('rewinds an element that is off screen and reveals it on scroll', async () => {
			const spacer = document.createElement('div');
			spacer.style.height = '300vh';
			const node = document.createElement('div');
			node.style.height = '100px';
			document.body.append(spacer, node);

			const reveal = createScrollReveal();
			const cleanup = reveal.attach(node);

			expect(reveal.revealed).toBe(false);

			node.scrollIntoView();
			await vi.waitFor(() => expect(reveal.revealed).toBe(true));

			cleanup?.();
		});

		it('leaves an element that is already on screen alone', () => {
			const node = document.createElement('div');
			node.style.height = '10px';
			document.body.append(node);

			const reveal = createScrollReveal();

			expect(reveal.attach(node)).toBeUndefined();
			expect(reveal.revealed).toBe(true);
		});
	});
}

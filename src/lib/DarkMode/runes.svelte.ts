import { mode as modeStore, toggleMode } from 'mode-watcher';

import { fromStore } from 'svelte/store';
import { on } from 'svelte/events';
import { browser } from '$app/environment';

export const mode = fromStore(modeStore);

export function isDark() {
	return mode.current === 'dark';
}

/**
 * check if the browser supports appearance transition
 */
export class CheckTransitions {
	#isReduced = $state(false);
	#isViewTransitionAvailable = $state(false);
	#mediaQuery: MediaQueryList | undefined = undefined;

	#isAppearanceTransition = $derived(this.#isViewTransitionAvailable && !this.#isReduced);
	constructor() {
		if (!browser) {
			return;
		}

		// @ts-expect-error experimental API
		this.#isViewTransitionAvailable = document.startViewTransition != null;
		this.#mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		this.#isReduced = this.#mediaQuery.matches;

		on(this.#mediaQuery, 'change', (_event) => {
			const event = _event as MediaQueryListEvent;
			this.#isReduced = event.matches;
		});
	}

	get isAppearanceTransition() {
		return this.#isAppearanceTransition;
	}
}

/**
 * Credit to [@hooray](https://github.com/hooray)
 * @see https://github.com/vuejs/vitepress/pull/2347
 */
export function toggleDark(event: MouseEvent) {
	const ct = new CheckTransitions();
	if (!ct.isAppearanceTransition) {
		toggleMode();
		return;
	}

	const x = event.clientX;
	const y = event.clientY;
	const endRadius = Math.hypot(
		Math.max(x, innerWidth - x),
		Math.max(y, innerHeight - y),
	);
		// @ts-expect-error: Transition API
	// eslint-disable-next-line ts/no-unsafe-call, ts/no-unsafe-assignment
	const transition = document.startViewTransition(() => toggleMode());

	// eslint-disable-next-line ts/no-unsafe-call, ts/no-unsafe-member-access
	transition.ready.then(() => {
		const clipPath = [
			`circle(0px at ${x}px ${y}px)`,
			`circle(${endRadius}px at ${x}px ${y}px)`,
		];
		document.documentElement.animate(
			{
				clipPath: isDark()
					? [...clipPath].reverse()
					: clipPath,
			},
			{
				duration: 400,
				easing: 'ease-out',
				pseudoElement: isDark()
					? '::view-transition-old(root)'
					: '::view-transition-new(root)',
			},
		);
	});
}

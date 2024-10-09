import { on } from 'svelte/events';
import { browser } from '$app/environment';

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

		this.#isViewTransitionAvailable = document.startViewTransition != null;
		this.#mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		this.#isReduced = this.#mediaQuery.matches;

		on(this.#mediaQuery, 'change', (_event) => {
			const event = _event;
			this.#isReduced = event.matches;
		});
	}

	get isAppearanceTransition() {
		return this.#isAppearanceTransition;
	}
}

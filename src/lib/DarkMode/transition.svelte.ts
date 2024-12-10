import { browser } from '$app/environment';
import { prefersReducedMotion } from 'svelte/motion';

/**
 * check if the browser supports appearance transition
 */
export class CheckTransitions {
	#isViewTransitionAvailable = $state(false);

	constructor() {
		if (!browser) {
			return;
		}

		this.#isViewTransitionAvailable = document.startViewTransition != null;
	}

	get isAppearanceTransition() {
		return !prefersReducedMotion.current && this.#isViewTransitionAvailable;
	}
}

import { on } from 'svelte/events';
import { withoutTransition } from './without-transition';
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

let _isDark = $state.raw(browser && document.documentElement.classList.contains('dark'));
const ct = new CheckTransitions();

export function isDark() {
	return _isDark;
}

export function toggleMode(): void {
	if (_isDark) {
		document.documentElement.classList.remove('dark');
	}
	else {
		document.documentElement.classList.add('dark');
	}
	_isDark = !_isDark;
}

/**
 * Credit to [@hooray](https://github.com/hooray)
 * @see https://github.com/vuejs/vitepress/pull/2347
 */
export function toggleDark(event: MouseEvent) {
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

	const transition = document.startViewTransition(() => toggleMode());

	const transitionAction = () => {
		const clipPath = [
			`circle(0px at ${x}px ${y}px)`,
			`circle(${endRadius}px at ${x}px ${y}px)`,
		];
		document.documentElement.animate(
			{
				clipPath: _isDark
					? [...clipPath].reverse()
					: clipPath,
			},
			{
				duration: 400,
				easing: 'ease-out',
				pseudoElement: _isDark
					? '::view-transition-old(root)'
					: '::view-transition-new(root)',
			},
		);
	};

	// eslint-disable-next-line ts/no-floating-promises
	transition.ready.then(() => withoutTransition(transitionAction));
}

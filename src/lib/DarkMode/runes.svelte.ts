import { withoutTransition } from './without-transition';
import { CheckTransitions } from './transition.svelte';
import { browser } from '$app/environment';

export class UseDarkMode {
	_isDark = $state(true);
	ct = new CheckTransitions();

	constructor() {
		if (browser) {
			this._isDark = document.documentElement.classList.contains('dark');
		}
	}

	get isDark() {
		return this._isDark;
	}

	toggleMode = () => {
		if (this._isDark) {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
		else {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		}
		this._isDark = !this._isDark;
	};

	/**
	 * Credit to [@hooray](https://github.com/hooray)
	 * @see https://github.com/vuejs/vitepress/pull/2347
	 */
	toggleDark = (event: MouseEvent) => {
		if (!this.ct?.isAppearanceTransition) {
			this.toggleMode();
			return;
		}

		const x = event.clientX;
		const y = event.clientY;
		const endRadius = Math.hypot(
			Math.max(x, innerWidth - x),
			Math.max(y, innerHeight - y),
		);

		const transition = document.startViewTransition(() => {
			this.toggleMode();
		});

		const transitionAction = () => {
			const clipPath = [
				`circle(0px at ${x}px ${y}px)`,
				`circle(${endRadius}px at ${x}px ${y}px)`,
			];
			document.documentElement.animate(
				{
					clipPath: this._isDark
						? [...clipPath].reverse()
						: clipPath,
				},
				{
					duration: 400,
					easing: 'ease-out',
					pseudoElement: this._isDark
						? '::view-transition-old(root)'
						: '::view-transition-new(root)',
				},
			);
		};

		// eslint-disable-next-line ts/no-floating-promises
		transition.ready.then(() => withoutTransition(transitionAction));
	};
}

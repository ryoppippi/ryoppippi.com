import { withoutTransition } from './without-transition';
import { CheckTransitions } from './transition.svelte';
import { browser } from '$app/environment';

let isDark = $state(true);
const ct = new CheckTransitions();

function toggleMode(): void {
	if (isDark) {
		document.documentElement.classList.remove('dark');
		localStorage.setItem('theme', 'light');
	}
	else {
		document.documentElement.classList.add('dark');
		localStorage.setItem('theme', 'dark');
	}
	isDark = !isDark;
}

/**
 * Credit to [@hooray](https://github.com/hooray)
 * @see https://github.com/vuejs/vitepress/pull/2347
 */
function toggleDark(event: MouseEvent) {
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

	const transition = document.startViewTransition(async () => toggleMode());

	const transitionAction = () => {
		const clipPath = [
			`circle(0px at ${x}px ${y}px)`,
			`circle(${endRadius}px at ${x}px ${y}px)`,
		];
		document.documentElement.animate(
			{
				clipPath: isDark
					? [...clipPath].reverse()
					: clipPath,
			},
			{
				duration: 400,
				easing: 'ease-out',
				pseudoElement: isDark
					? '::view-transition-old(root)'
					: '::view-transition-new(root)',
			},
		);
	};

	// eslint-disable-next-line ts/no-floating-promises
	transition.ready.then(() => withoutTransition(transitionAction));
}

export function useDarkMode() {
	if (browser) {
		isDark = document.documentElement.classList.contains('dark');
	}
	return {
		isDark,
		toggleMode,
		toggleDark,
	};
}

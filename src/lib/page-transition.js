/*+ code from https://github.com/geoffrich/sveltekit-view-transitions/blob/bd1e84a7cb0325bf3096b977ee3d7ce2e48041d3/src/lib/page-transition.js */

import { beforeNavigate } from '$app/navigation';
import { navigating } from '$app/stores';
import { onDestroy } from 'svelte';

function getNavigationStore() {
	/** @type {((val?: any) => void)[]} */
	let callbacks = [];

	const navigation = {
		...navigating,
		complete: async () => {
			await new Promise((res, _) => {
				callbacks.push(res);
			});
		}
	};

	// This used to subscribe inside the callback, but that resolved the promise too early
	const unsub = navigating.subscribe((n) => {
		if (n === null) {
			while (callbacks.length > 0) {
				const res = callbacks.pop();
				res?.();
			}
		}
	});

	onDestroy(() => {
		unsub();
	});

	return navigation;
}

export const preparePageTransition = () => {
	const navigation = getNavigationStore();

	// before navigating, start a new transition
	beforeNavigate(() => {
		// @ts-expect-error - startViewTransition is not in the types
		if (!document?.startViewTransition) return;

		const navigationComplete = navigation.complete();

		// @ts-expect-error - startViewTransition is not in the types
		document.startViewTransition(async () => {
			await navigationComplete;
		});
	});
};

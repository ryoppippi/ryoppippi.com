/* eslint-disable */
import 'unplugin-icons/types/svelte';

declare namespace App {
	// interface Locals {}
	interface PageData {
		title: string;
	}
	// interface Error {}
	// interface Platform {}
}

declare global {
	interface ViewTransition {
		updateCallbackDone: Promise<void>;
		ready: Promise<void>;
		finished: Promise<void>;
		skipTransition: () => void;
	}

	interface Document {
		startViewTransition: (
			updateCallback: () => Promise<void>,
		) => ViewTransition;
	}
}

/* eslint-enable */

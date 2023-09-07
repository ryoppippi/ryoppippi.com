import 'unplugin-icons/types/svelte';

declare namespace App {
	// interface Locals {}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}
}

declare global {
	type Post = {
		title: string;
		slug: string;
		pubDate: string;
	};

	interface ViewTransition {
		updateCallbackDone: Promise<void>;
		ready: Promise<void>;
		finished: Promise<void>;
		skipTransition: () => void;
	}

	interface Document {
		startViewTransition(updateCallback: () => Promise<void>): ViewTransition;
	}
}

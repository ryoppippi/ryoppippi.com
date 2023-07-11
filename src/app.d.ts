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
}

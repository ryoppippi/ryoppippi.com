// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

/// <reference types="unplugin-icons/types/svelte" />
declare namespace App {
	// interface Locals {}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}
}

type Post = {
	title: string;
	slug: string;
	pubDate: string;
};

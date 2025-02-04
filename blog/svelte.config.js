import { md, SvelteMarkdown } from '@ryoppippi.com/markdown';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [
		SvelteMarkdown(md),
		vitePreprocess(),
	],

	kit: {
	// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
	},
};

export default config;

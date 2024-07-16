import process from 'node:process';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { importAssets } from 'svelte-preprocess-import-assets';
import { isDevelopment } from 'std-env';

const dev = isDevelopment;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess(), importAssets()],

	vitePlugin: {
		inspector: dev,
		dynamicCompileOptions({ filename }) {
			/* sveltekit-tweet が rune に対応していないので、user script のみ rune を強制する https://github.com/sveltejs/svelte/issues/9632#issuecomment-1825498213 */
			if (!filename.includes('node_modules')) {
				return { runes: true };
			}
		},
	},

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			precompress: true,
		}),
		alias: {
			$posts: './src/posts',
		},
		paths: {
			assets: dev ? '' : process.env.CF_PAGES_URL,
		},
	},
};

export default config;

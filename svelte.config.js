import path from 'node:path';
import process from 'node:process';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { importAssets } from 'svelte-preprocess-import-assets';
import { isDevelopment } from 'std-env';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess(), importAssets()],

	vitePlugin: {
		inspector: isDevelopment,
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
		typescript: {
			config(config) {
				config.include.push(path.join(import.meta.dirname, 'uno.config.ts'));
			},
		},
		alias: {
			$contents: './src/contents',
		},
		paths: {
			/**
			  @see https://developers.cloudflare.com/pages/configuration/build-configuration#environment-variables
			  @see https://kit.svelte.jp/docs/configuration#paths
			 */
			assets: isDevelopment
				? ''
				: process.env.CF_PAGES_BRANCH === 'main'
					? `https://ryoppippi.com`
					: process.env.CF_PAGES_URL,
		},
	},
};

export default config;

import path from 'node:path';
import process from 'node:process';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

import { isDevelopment } from 'std-env';

import { importAssets } from 'svelte-preprocess-import-assets';

import SveltweetPreprocessor from 'sveltweet/preprocessor';

import { Route } from './routes.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [
		SveltweetPreprocessor(),
		importAssets(),
		vitePreprocess(),
	],

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
			$components: './src/components',
		},
		prerender: {
			handleHttpError: ({ path, message }) => {
				if (Route.find(({ from }) => from === path)) {
					return;
				}

				throw new Error(message);
			},
		},
		paths: {
			/**
			  @see https://developers.cloudflare.com/pages/configuration/build-configuration#environment-variables
			  @see https://kit.svelte.jp/docs/configuration#paths
			 */
			assets: (isDevelopment
				? ''
				: process.env.CF_PAGES_BRANCH !== 'main'
					? process.env.CF_PAGES_URL
					: undefined) ?? 'https://ryoppippi.com',
		},
	},
};

export default config;

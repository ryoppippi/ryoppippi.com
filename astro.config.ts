import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';

import mdx from '@astrojs/mdx';

import extractorSvelte from '@unocss/extractor-svelte';
import UnoCSS from 'unocss/astro';
import Icons from 'unplugin-icons/vite';

import { faviconsPlugin } from 'vite-plugin-favicons';

import metaTags from 'astro-meta-tags';
import { isDevelopment } from 'std-env';

// https://astro.build/config
export default defineConfig({
	integrations: [
		svelte(),
		mdx(),
		UnoCSS({
			extractors: [extractorSvelte()],
			injectReset: true, // Inject the reset css. When passing `true`, `@unocss/reset/tailwind.css` will be used
		}),
		metaTags(),
	],
	vite: {
		plugins: [
			Icons({
				compiler: 'svelte',
				autoInstall: isDevelopment,
			}),
			faviconsPlugin({
				cache: true,
				imgSrc: './src/assets/ryoppippi.jpg',
				/* ===== metadataの設定 ===== */
				path: `/favicons`,
				lang: 'ja-JP',
				orientation: 'portrait',
			}),
		],
	},
});

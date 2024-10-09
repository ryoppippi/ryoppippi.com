// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';

import mdx from '@astrojs/mdx';

import extractorSvelte from '@unocss/extractor-svelte';
import UnoCSS from 'unocss/astro';

// https://astro.build/config
export default defineConfig({
	integrations: [
		svelte(),
		mdx(),
		UnoCSS({
			extractors: [
				extractorSvelte(),
			],
		}),
	],
});

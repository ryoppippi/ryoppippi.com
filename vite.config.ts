import path from 'node:path';
import { cloudflareRedirect } from '@ryoppippi/vite-plugin-cloudflare-redirect';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import extractorSvelte from '@unocss/extractor-svelte';
import Macros from '@unplugin/macros/vite';
// @ts-expect-error no type
import autoImport from 'sveltekit-autoimport';
import UnoCSS from 'unocss/vite';
import { attributifyToClass } from 'unplugin-attributify-to-class/vite';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-svelte-components/vite';

import { defineConfig } from 'vite';

import { faviconsPlugin } from 'vite-plugin-favicons';

import { Route } from './routes.js';

function relativePath(...args: string[]): string {
	return path.resolve(import.meta.dirname, ...args);
}

export default defineConfig({
	esbuild: {
		target: 'es2022',
	},
	plugins: [
		/* favicon と metadata の設定 */
		faviconsPlugin({
			cache: true,
			imgSrc: relativePath('./static/ryoppippi.jpg'),
			/* ===== metadataの設定 ===== */
			path: `/favicons`,
			lang: 'ja-JP',
			orientation: 'portrait',
		}),
		cloudflareRedirect({
			mode: 'generate',
			entries: Route,
		}),
		Icons({ compiler: 'svelte' }),
		enhancedImages(),
		Macros(),
		attributifyToClass({
			include: [/\.svelte$/],
		}),
		UnoCSS({
			extractors: [
				extractorSvelte(),
			],
		}),
		Components({
			dirs: ['src/components'],
			dts: './src/components.d.ts',
		}),
		// eslint-disable-next-line ts/no-unsafe-call
		autoImport({
			include: ['**/*.(svelte|md)'],
			components: ['./src/components'],
			module: {
				'sveltweet': [
					'Tweet',
					'TweetNotFound',
				],
				'sveltekit-embed': [
					'YouTube',
				],
			},
		}),
		sveltekit(),
	],
});

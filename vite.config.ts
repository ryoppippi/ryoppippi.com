import path from 'node:path';
import UnpluginTypia from '@ryoppippi/unplugin-typia/vite';
import { cloudflareRedirect } from '@ryoppippi/vite-plugin-cloudflare-redirect';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import extractorSvelte from '@unocss/extractor-svelte';
import Macros from '@unplugin/macros/vite';
import { isDevelopment } from 'std-env';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-svelte-components/vite';
import { defineConfig } from 'vite';
import { denyImports } from 'vite-env-only';

import { faviconsPlugin } from 'vite-plugin-favicons';

// @ts-expect-error no type
import autoImport from 'sveltekit-autoimport';
import UnoCSS from 'unocss/vite';

import { Route } from './routes.js';

function relativePath(...args: string[]): string {
	return path.resolve(import.meta.dirname, ...args);
}

export default defineConfig({
	esbuild: {
		target: 'es2022',
	},
	plugins: [
		denyImports({
			client: {
				specifiers: ['fs-extra', /^node:/],
				files: ['**/.server/*', '**/*.server.*'],
			},
		}),
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
		UnpluginTypia({ log: 'verbose', cache: true }),
		Icons({
			compiler: 'svelte',
			autoInstall: isDevelopment,
		}),
		enhancedImages(),
		Macros(),
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
					'SvelteTweet',
					'SvelteTweetNotFound',
				],
				'sveltekit-embed': [
					'YouTube',
				],
			},
		}),
		sveltekit(),
	],
});

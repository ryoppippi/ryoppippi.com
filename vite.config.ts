import path from 'node:path';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import Macros from '@unplugin/macros/vite';
import UnpluginTypia from '@ryoppippi/unplugin-typia/vite';
import { cloudflareRedirect } from '@ryoppippi/vite-plugin-cloudflare-redirect';

import extractorSvelte from '@unocss/extractor-svelte';
import UnoCSS from 'unocss/vite';
import { faviconsPlugin } from 'vite-plugin-favicons';

function relativePath(...args: string[]): string {
	return path.resolve(import.meta.dirname, ...args);
}

export default defineConfig({
	plugins: [
		/* favicon と metadata の設定 */
		faviconsPlugin({
			imgSrc: relativePath('./src/lib/assets/ryoppippi.png'),
			/* ===== metadataの設定 ===== */
			path: `/favicons`,
			lang: 'ja-JP',
			orientation: 'portrait',
		}),
		cloudflareRedirect({
			mode: 'generate',
			entries: [
				{ from: '/cv', to: 'https://cv.ryoppippi.com' },
				{ from: '/icon', to: '/ryoppippi.png' },
				{ from: '/github', to: 'https://github.com/ryoppippi' },
				{ from: '/gh', to: 'https://github.com/ryoppippi' },
				{ from: '/pr', to: 'https://pr.ryoppippi.com' },
			],
		}),
		UnpluginTypia({ log: 'verbose' }),
		enhancedImages(),
		Macros(),
		UnoCSS({
			extractors: [
				extractorSvelte(),
			],
		}),
		sveltekit(),
	],
});

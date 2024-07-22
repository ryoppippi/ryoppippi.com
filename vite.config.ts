import path from 'node:path';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import Macros from '@unplugin/macros/vite';
import Icons from 'unplugin-icons/vite';
import UnpluginTypia from '@ryoppippi/unplugin-typia/vite';
import { isCI } from 'std-env';
import { cloudflareRedirect } from '@ryoppippi/vite-plugin-cloudflare-redirect';
import { faviconPlugin } from './plugins/favicons';

function relativePath(...args: string[]): string {
	return path.resolve(import.meta.dirname, ...args);
}

export default defineConfig({
	plugins: [
		/* favicon と metadata の設定 */
		faviconPlugin({
			imgSrc: relativePath('./src/lib/assets/ryoppippi.png'),
			faviconAssetsDest: relativePath('./static/favicons'),
			htmlDest: relativePath('./src/lib/assets/favicons.html'),
			/* ===== metadataの設定 ===== */
			path: `/favicons`,
			lang: 'ja-JP',
			orientation: 'portrait',
			/* ========================= */
		}),
		cloudflareRedirect({
			mode: 'generate',
			entries: [
				{ from: '/cv', to: 'https://cv.ryoppippi.com' },
			],
		}),
		UnpluginTypia({ cache: !isCI, log: 'verbose' }),
		enhancedImages(),
		Macros(),
		sveltekit(),
		Icons({ compiler: 'svelte', autoInstall: true }),
	],
});

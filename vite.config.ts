import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import Macros from '@unplugin/macros/vite';
import Icons from 'unplugin-icons/vite';
import UnpluginTypia from '@ryoppippi/unplugin-typia/vite';
import { isCI } from 'std-env';
import { cloudflareRedirect } from '@ryoppippi/vite-plugin-cloudflare-redirect';
import { faviconPlugin } from './plugins/favicons';

export default defineConfig({
	plugins: [
		cloudflareRedirect({
			mode: 'generate',
			entries: [
				{ from: '/cv', to: 'https://cv.ryoppippi.com', status: 301 },
			],
		}),
		faviconPlugin,
		UnpluginTypia({ cache: !isCI, log: 'verbose' }),
		enhancedImages(),
		Macros(),
		sveltekit(),
		Icons({ compiler: 'svelte', autoInstall: true }),
	],
});

import path from 'node:path';
import process from 'node:process';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import Icons from 'unplugin-icons/vite';
import Macros from '@unplugin/macros/vite';
import Replace from 'unplugin-replace/vite';
import UnpluginTypia from '@ryoppippi/unplugin-typia/vite';
import { denyImports } from 'vite-env-only';
import { cloudflareRedirect } from '@ryoppippi/vite-plugin-cloudflare-redirect';
import { faviconsPlugin } from 'vite-plugin-favicons';
import { isDevelopment } from 'std-env';

import extractorSvelte from '@unocss/extractor-svelte';
import UnoCSS from 'unocss/vite';

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
				specifiers: ['fs-extra', /^node:/, 'typia'],
				files: ['**/.server/*', '**/*.server.*'],
			},
		}),
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
				{ from: '/gh-by-stars', to: 'https://github.com/ryoppippi?tab=repositories&sort=stargazers' },
				{ from: '/pr', to: 'https://pr.ryoppippi.com' },
				{ from: '/zenn', to: 'https://zenn.dev/ryoppippi' },
				{ from: '/linkedin', to: 'https://www.linkedin.com/in/ryoppippi/' },
				{ from: '/twitter', to: 'https://x.com/ryoppippi' },
				{ from: '/bsky', to: 'https://bsky.app/profile/ryoppippi.com' },
				{ from: '/reddit', to: '/https://www.reddit.com/user/ryoppippi' },
				{ from: '/youtube', to: 'https://www.youtube.com/channel/UCJbUM-yZx6mESJw82-OpMuQ' },
			],
		}),
		UnpluginTypia({ log: 'verbose', cache: true }),
		Icons({
			compiler: 'svelte',
			autoInstall: isDevelopment,
		}),
		Replace({
			values: [
				{
					find: 'process.env.DOMAIN',
					replacement: `'${(process.env.CF_PAGES_BRANCH === 'main' ? null : process.env.CF_PAGES_URL) ?? 'https://ryoppippi.com'}'`,
				},
			],
		}),
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

import path from 'node:path';
import { cloudflareRedirect } from '@ryoppippi/vite-plugin-cloudflare-redirect';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

import { faviconsPlugin } from 'vite-plugin-favicons';
import { defineConfig } from 'vitest/config';

import { Route } from './routes.js';

function relativePath(...args: string[]): string {
	return path.resolve(import.meta.dirname, ...args);
}

export default defineConfig({
	plugins: [
		/* blog記事の追加・削除時にサーバーを再起動してブラウザをリロード */
		{
			name: 'blog-watcher',
			configureServer(server) {
				server.watcher.on('add', (file) => {
					if (file.includes('src/contents/blog') && file.endsWith('.md')) {
						void server.restart().then(() => {
							server.ws.send({ type: 'full-reload' });
						});
					}
				});
				server.watcher.on('unlink', (file) => {
					if (file.includes('src/contents/blog') && file.endsWith('.md')) {
						void server.restart().then(() => {
							server.ws.send({ type: 'full-reload' });
						});
					}
				});
			},
		},
		/* favicon と metadata の設定 */
		faviconsPlugin({
			cache: true,
			imgSrc: relativePath('./static/ryoppippi.jpg'),
			/* ===== metadataの設定 ===== */
			path: `/favicons`,
			lang: 'ja-JP',
			orientation: 'portrait',
			icons: {
				android: false,
				appleIcon: false,
				appleStartup: false,
				favicons: true,
				windows: false,
				yandex: false,
			},
		}),
		cloudflareRedirect({
			mode: 'generate',
			entries: Route,
		}),
		tailwindcss(),
		sveltekit(),
	],
	test: {
		globals: true,
		environment: 'node',
		includeSource: ['src/markdown/**/*.ts'],
	},
});

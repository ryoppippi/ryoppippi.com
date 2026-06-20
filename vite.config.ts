import type { Plugin } from 'vite';
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { cloudflareRedirect } from '@ryoppippi/vite-plugin-cloudflare-redirect';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { FontaineTransform } from 'fontaine';
import { isDevelopment } from 'std-env';
import { importAssets } from 'svelte-preprocess-import-assets';

import { faviconsPlugin } from 'vite-plugin-favicons';
import { defineConfig } from 'vitest/config';

import { fontAssets, fontFaceGroups } from './font-assets.ts';
import { Route } from './routes.ts';
import { publishedBlogPosts } from './src/contents/blog/index.ts';
import svelteMarkdown from './src/markdown/preprocessor.ts';

process.env.PUBLIC_ORIGIN ??= isDevelopment ? 'http://localhost:5173' : 'https://ryoppippi.com';

function relativePath(...args: string[]): string {
	return path.resolve(import.meta.dirname, ...args);
}

function blogEntry(filename: string): `/blog/${string}` {
	return `/blog/${filename}`;
}

function fontAssetsPlugin(): Plugin {
	return {
		name: 'font-assets',
		async buildStart() {
			await Promise.all(
				fontAssets.map(async ({ packageName, fileName }) => {
					const source = relativePath('node_modules', packageName, 'files', fileName);
					const destination = relativePath('static', 'fonts', fileName);

					try {
						await mkdir(path.dirname(destination), { recursive: true });
						await copyFile(source, destination);
					}
					catch (error) {
						const reason = error instanceof Error ? error.message : String(error);

						this.error([
							`Failed to copy font asset ${packageName}/${fileName}.`,
							`Source: ${source}`,
							`Destination: ${destination}`,
							`Reason: ${reason}`,
						].join('\n'));
					}
				}),
			);
		},
	};
}

function fontFaceVirtualCssPlugin(): Plugin {
	const prefix = 'virtual:font-face/';
	const resolvedPrefix = `\0${prefix}`;

	type FontFaceGroupName = keyof typeof fontFaceGroups;

	function isFontFaceGroupName(value: string): value is FontFaceGroupName {
		return value in fontFaceGroups;
	}

	function fontFaceCss(groupName: FontFaceGroupName): string {
		const families = new Set<string>(fontFaceGroups[groupName]);

		return fontAssets
			.filter(({ family }) => families.has(family))
			.map(({ family, fileName, weight }) => `
@font-face {
	font-family: ${JSON.stringify(family)};
	font-style: normal;
	font-display: swap;
	font-weight: ${weight};
	src: url('/fonts/${fileName}') format('woff2');
}
			`.trim())
			.join('\n\n');
	}

	return {
		name: 'font-face-virtual-css',
		resolveId(id) {
			if (id.startsWith(prefix)) {
				return `${resolvedPrefix}${id.slice(prefix.length)}`;
			}
		},
		load(id) {
			if (!id.startsWith(resolvedPrefix)) {
				return;
			}

			const groupName = id.slice(resolvedPrefix.length).replace(/\.css$/, '');

			if (!isFontFaceGroupName(groupName)) {
				this.error(`Unknown font face group: ${groupName}`);
			}

			return fontFaceCss(groupName);
		},
	};
}

export default defineConfig({
	plugins: [
		/* Restart the dev server and reload the browser when a blog post is added or removed */
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
		/* favicon and metadata configuration */
		faviconsPlugin({
			cache: true,
			imgSrc: relativePath('./static/ryoppippi.jpg'),
			/* ===== metadata configuration ===== */
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
		fontAssetsPlugin(),
		fontFaceVirtualCssPlugin(),
		FontaineTransform.vite({
			fallbacks: {
				'DM Mono': ['Courier New'],
				'Inter': ['Arial'],
				'JetBrains Mono': ['Courier New'],
				'Roboto Condensed': ['Arial'],
			},
		}),
		tailwindcss(),
		sveltekit({
			extensions: ['.svelte', '.md'],
			// Consult https://svelte.dev/docs/kit/integrations#preprocessors
			// for more information about preprocessors
			preprocess: [
				svelteMarkdown(),
				importAssets(),
				vitePreprocess(),
			],
			vitePlugin: {
				inspector: isDevelopment,
				dynamicCompileOptions({ filename }) {
					if (!filename.includes('node_modules')) {
						return { runes: true };
					}
				},
			},
			compilerOptions: {
				experimental: {
					async: true,
				},
			},
			adapter: adapter(),
			experimental: {
				remoteFunctions: true,
			},
			typescript: {
				config(config) {
					(config.include as string[]).push(path.join(import.meta.dirname, '*.ts'));
					(config.include as string[]).push(path.join(import.meta.dirname, 'scripts/**/*.ts'));
				},
			},
			alias: {
				$contents: './src/contents',
				$components: './src/components',
			},
			prerender: {
				handleHttpError: ({ path, message }) => {
					if (Route.find(({ from }) => from === path) != null) {
						return;
					}

					throw new Error(message);
				},
				entries: [
					'/dotfiles.md',
					...publishedBlogPosts.flatMap(({ filename }) => [
						blogEntry(filename),
						blogEntry(`${filename}.md`),
					]),
				],
			},
		}),
	],
	test: {
		globals: true,
		environment: 'node',
		includeSource: ['src/lib/**/*.ts', 'src/markdown/**/*.ts'],
	},
});

import { basename, join } from 'node:path';
import { flatMap } from '@core/iterutil/pipe';
import { pipe } from '@core/pipe';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { isDevelopment } from 'std-env';
import { importAssets } from 'svelte-preprocess-import-assets';
import { glob } from 'tinyglobby';

import { Route } from './routes.js';
import svelteMarkdown from './src/markdown/preprocessor.ts';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
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

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		experimental: {
			remoteFunctions: true,
		},
		typescript: {
			config(config) {
				config.include.push(join(import.meta.dirname, 'uno.config.ts'));
				config.include.push(join(import.meta.dirname, 'scripts/**/*.ts'));
			},
		},
		alias: {
			$contents: './src/contents',
			$components: './src/components',
		},
		prerender: {
			handleHttpError: ({ path, message }) => {
				if (Route.find(({ from }) => from === path)) {
					return;
				}

				throw new Error(message);
			},
			entries: await (async () => {
				const blogDir = join(import.meta.dirname, 'src/contents/blog');

				// Support both flat .md files and slug/index.md directory structure
				const flatFiles = await glob('*.md', { cwd: blogDir, absolute: true });
				const indexFiles = await glob('*/index.md', { cwd: blogDir, absolute: true });

				const iter = pipe(
					[
						...flatFiles.map(file => basename(file, '.md')),
						...indexFiles.map(file => basename(file.replace('/index.md', ''))),
					],
					flatMap(slug => [
						`/blog/${slug}`,
						`/blog/${slug}.md`,
					]),
				);

				return Array.from(iter);
			})(),
		},
	},
};

export default config;

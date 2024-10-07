import path from 'node:path';
import process from 'node:process';
import adapter from '@sveltejs/adapter-static';
import { isDevelopment } from 'std-env';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { importAssets } from 'svelte-preprocess-import-assets';

import markdownit from 'markdown-it';

import anchor from 'markdown-it-anchor';

import MarkdownItShiki from '@shikijs/markdown-it';
import { rendererRich, transformerTwoslash } from '@shikijs/twoslash';

import GitHubAlerts from 'markdown-it-github-alerts';

// @ts-expect-error no types
import Figures from 'markdown-it-image-figures';

import LinkAttributes from 'markdown-it-link-attributes';

import Budoux from 'markdown-it-budoux';

import { slugify } from './src/lib/slugify.server.js';
import svelteMarkdown from './src/markdown/preprocessor.js';
import { transformerEscape } from './src/markdown/shiki-transformer.js';

import { Route } from './routes.js';

const md = markdownit({
	html: true,
	linkify: true,
	typographer: true,
});

md.use(anchor, {
	slugify,
	permalink: anchor.permalink.linkInsideHeader({
		symbol: '#',
		renderAttrs: () => ({ 'aria-hidden': 'true' }),
	}),
});

md.use(LinkAttributes, {
	/** @param {string} link */
	matcher: link => /^https?:\/\//.test(link),
	attrs: {
		target: '_blank',
		rel: 'noopener',
	},
});

md.use(await MarkdownItShiki({
	themes: {
		dark: 'vitesse-dark',
		light: 'vitesse-light',
	},
	transformers: [
		transformerTwoslash({
			explicitTrigger: true,
			renderer: rendererRich(),
		}),
		transformerEscape(),
	],
}));

md.use(GitHubAlerts);

md.use(Figures, {
	figcaption: true,
	lazy: true,
	async: true,
});

md.use(Budoux({ language: 'ja' }));

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [
		svelteMarkdown(md),
		importAssets(),
		vitePreprocess(),
	],

	vitePlugin: {
		inspector: isDevelopment,
		dynamicCompileOptions({ filename }) {
			/* sveltekit-tweet が rune に対応していないので、user script のみ rune を強制する https://github.com/sveltejs/svelte/issues/9632#issuecomment-1825498213 */
			if (!filename.includes('node_modules')) {
				return { runes: true };
			}
		},
	},

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			precompress: true,
		}),
		typescript: {
			config(config) {
				config.include.push(path.join(import.meta.dirname, 'uno.config.ts'));
			},
		},
		alias: {
			$contents: './src/contents',
		},
		prerender: {
			handleHttpError: ({ path, message }) => {
				if (Route.find(({ from }) => from === path)) {
					return;
				}

				throw new Error(message);
			},
		},
		paths: {
			/**
			  @see https://developers.cloudflare.com/pages/configuration/build-configuration#environment-variables
			  @see https://kit.svelte.jp/docs/configuration#paths
			 */
			assets: isDevelopment
				? ''
				: process.env.CF_PAGES_BRANCH === 'main'
					? `https://ryoppippi.com`
					: process.env.CF_PAGES_URL,
		},
	},
};

export default config;

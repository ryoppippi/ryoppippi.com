import { basename, join } from 'node:path';
import { flatMap, map } from '@core/iterutil/pipe';
import { pipe } from '@core/pipe';
import MarkdownItShiki from '@shikijs/markdown-it';
import { rendererRich, transformerTwoslash } from '@shikijs/twoslash';
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

import markdownit from 'markdown-it';

import anchor from 'markdown-it-anchor';
import Budoux from 'markdown-it-budoux';

import MarkdownItCollapsible from 'markdown-it-collapsible';

import GitHubAlerts from 'markdown-it-github-alerts';

// @ts-expect-error no types
import Figures from 'markdown-it-image-figures';
import LinkAttributes from 'markdown-it-link-attributes';

import LinkPreview from 'markdown-it-link-preview';

import MarkdownItMagicLink from 'markdown-it-magic-link';

import MDC from 'markdown-it-mdc';

import { isDevelopment } from 'std-env';

import { importAssets } from 'svelte-preprocess-import-assets';

import SveltweetPreprocessor from 'sveltweet/preprocessor';
import { glob } from 'tinyglobby';
import { Route } from './routes.js';

import { slugify } from './src/lib/slugify.server.js';
import svelteMarkdown from './src/markdown/preprocessor.js';
import { transformerEscape } from './src/markdown/shiki-transformer.js';

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

md.use(LinkPreview);

md.use(await MarkdownItShiki({
	themes: {
		dark: 'kanagawa-dragon',
		light: 'kanagawa-lotus',
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

md.use(MarkdownItCollapsible);

md.use(Budoux({ language: 'ja' }));

md.use(MarkdownItMagicLink, {
	linksMap: {
		'vim-jp': { link: 'https://vim-jp.org/', imageUrl: 'https://vim-jp.org/assets/images/vim2-128.png' },
		'Svelte Japan': { link: 'https://svelte.jp', imageUrl: 'https://cdn.jsdelivr.net/gh/sveltejs/branding/svelte-logo-square.png' },
		'ryoppippi.com': { link: 'https://ryoppippi.com', imageUrl: 'https://ryoppippi.com/ryoppippi.jpg' },
	},
});

md.use(MDC);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [
		svelteMarkdown(md),
		SveltweetPreprocessor(),
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

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
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
				const iter = pipe(
					await glob('*.md', {
						cwd: join(import.meta.dirname, 'src/contents/blog'),
						absolute: true,
					}),
					map(file => basename(file, '.md')),
					flatMap(slug => [
						`/blog/${slug}`,
						`/blog/${slug}.md`,
					]),
				);

				return Array.from(iter);
			})(),
		},
		paths: {
			assets: (isDevelopment ? '' : 'https://ryoppippi.com'),
		},
	},
};

export default config;

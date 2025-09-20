import type { Config } from '@sveltejs/kit';
import { basename, join } from 'node:path';
import { flatMap, map } from '@core/iterutil/pipe';
import { pipe } from '@core/pipe';
import MarkdownItShiki from '@shikijs/markdown-it';
import { rendererRich, transformerTwoslash } from '@shikijs/twoslash';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

import markdownit from 'markdown-it';

import anchor from 'markdown-it-anchor';
import Budoux from 'markdown-it-budoux';

import MarkdownItCollapsible from 'markdown-it-collapsible';

import GitHubAlerts from 'markdown-it-github-alerts';

// @ts-expect-error no types
import Figures from 'markdown-it-image-figures';
import LinkAttributes from 'markdown-it-link-attributes';

// @ts-expect-error no types
import LinkPreview from 'markdown-it-link-preview';

import MarkdownItMagicLink from 'markdown-it-magic-link';

import MDC from 'markdown-it-mdc';

import { isDevelopment } from 'std-env';

import { importAssets } from 'svelte-preprocess-import-assets';

import { globSync } from 'tinyglobby';
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
	matcher: (link: string) => /^https?:\/\//.test(link),
	attrs: {
		target: '_blank',
		rel: 'noopener',
	},
});

// eslint-disable-next-line ts/no-unsafe-argument
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

// eslint-disable-next-line ts/no-unsafe-argument
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

// eslint-disable-next-line ts/no-unsafe-argument
md.use(MDC);

export default {
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
		experimental: {
			remoteFunctions: true,
		},
		typescript: {
			config(config: Record<string, unknown>) {
				const configs = ['uno.config.ts', 'svelte.config.ts', 'scripts/**/*.ts'];
				for (const c of configs) {
					(config.include as string[])?.push(join(import.meta.dirname, c));
				}
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
			entries: Array.from(pipe(
				globSync('*.md', {
					cwd: join(import.meta.dirname, 'src/contents/blog'),
					absolute: true,
				}),
				map(file => basename(file, '.md')),
				flatMap(slug => [
					`/blog/${slug}`,
					`/blog/${slug}.md`,
				] as const),
			)),
		},
	},
} satisfies Config;

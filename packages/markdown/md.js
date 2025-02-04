/* eslint-disable antfu/no-top-level-await */

import { slugify } from '@ryoppippi.com/libs/slugify.server.js';
import MarkdownItShiki from '@shikijs/markdown-it';

import { rendererRich, transformerTwoslash } from '@shikijs/twoslash';

import markdownit from 'markdown-it';

import anchor from 'markdown-it-anchor';

import Budoux from 'markdown-it-budoux';
import MarkdownItCollapsible from 'markdown-it-collapsible';

import GitHubAlerts from 'markdown-it-github-alerts';

import Figures from 'markdown-it-image-figures';

import LinkAttributes from 'markdown-it-link-attributes';
import LinkPreview from 'markdown-it-link-preview';

import MarkdownItMagicLink from 'markdown-it-magic-link';

import MDC from 'markdown-it-mdc';

import { transformerEscape } from './shiki-transformer.js';

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

export { md };

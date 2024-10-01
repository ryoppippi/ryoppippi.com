import markdownit from 'markdown-it';

import anchor from 'markdown-it-anchor';

import MarkdownItShiki from '@shikijs/markdown-it';
import { rendererRich, transformerTwoslash } from '@shikijs/twoslash';

import GitHubAlerts from 'markdown-it-github-alerts';

// @ts-expect-error no types
import Figures from 'markdown-it-image-figures';

import LinkAttributes from 'markdown-it-link-attributes';

import { slugify } from '$lib/util';

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

md.use(await MarkdownItShiki({
	themes: {
		dark: 'vitesse-dark',
		light: 'vitesse-light',
	},
	transformers: [
		transformerTwoslash({
			explicitTrigger: false,
			renderer: rendererRich(),
		}),
	],
}));

// eslint-disable-next-line ts/no-unsafe-argument
md.use(GitHubAlerts);

// eslint-disable-next-line ts/no-unsafe-argument
md.use(Figures, {
	figcaption: true,
	lazy: true,
	async: true,
});

export { md };

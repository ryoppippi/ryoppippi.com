import markdownit from 'markdown-it';

import anchor from 'markdown-it-anchor';
import { slugify } from '$lib/util';

import MarkdownItShiki from '@shikijs/markdown-it';
import { rendererRich, transformerTwoslash } from '@shikijs/twoslash';

import MarkdownItGitHubAlerts from 'markdown-it-github-alerts'

import GitHubAlerts from 'markdown-it-github-alerts'

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

md.use(GitHubAlerts)

export { md };

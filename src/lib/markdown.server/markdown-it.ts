import markdownit from 'markdown-it';
import anchor from 'markdown-it-anchor';
import MarkdownItShiki from '@shikijs/markdown-it';
import { rendererRich, transformerTwoslash } from '@shikijs/twoslash';
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

export { md };

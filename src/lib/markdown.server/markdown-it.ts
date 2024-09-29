import markdownit from 'markdown-it';
import anchor from 'markdown-it-anchor';
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

export { md };

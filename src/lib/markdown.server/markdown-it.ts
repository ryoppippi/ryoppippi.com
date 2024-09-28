import markdownit from 'markdown-it';
import anchor from 'markdown-it-anchor';
import { slugger } from '$lib/util';

const md = markdownit({
	html: true,
	linkify: true,
	typographer: true,
});

function slug(s: string) {
	return slugger.slug(s);
}

md.use(anchor, {
	slug,
	permalink: anchor.permalink.linkInsideHeader({
		symbol: '#',
		renderAttrs: () => ({ 'aria-hidden': 'true' }),
	}),
});

export { md };

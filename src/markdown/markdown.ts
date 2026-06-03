import { rendererRich, transformerTwoslash } from '@shikijs/twoslash';
import { createMarkdownExit } from 'markdown-exit';

import anchor from 'markdown-it-anchor';

import Budoux from 'markdown-it-budoux';
import MarkdownItCollapsible from 'markdown-it-collapsible';

import GitHubAlerts from 'markdown-it-github-alerts';

import Figures from 'markdown-it-image-figures';

import LinkAttributes from 'markdown-it-link-attributes';
import LinkPreview from 'markdown-it-link-preview';

import MarkdownItMagicLink from 'markdown-it-magic-link';

import MDC from 'markdown-it-mdc';

import { codeToHtml } from 'shiki';

import { slugify } from '../lib/slugify.server.ts';
import { magicLinks } from './magic-link.ts';
import { transformerEscape } from './shiki-transformer.ts';

export async function highlightCode(code: string, lang: string) {
	return codeToHtml(code, {
		lang,
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
	});
}

const md = createMarkdownExit({
	html: true,
	linkify: true,
	typographer: true,
	highlight: highlightCode,
});

// @ts-expect-error markdown-exit type mismatch
md.use(anchor, {
	slugify,
	permalink: anchor.permalink.linkInsideHeader({
		symbol: '#',
		renderAttrs: () => ({ 'aria-hidden': 'true', 'tabindex': '-1' }),
	}),
});

// @ts-expect-error markdown-exit type mismatch
md.use(LinkAttributes, {
	/** @param {string} link */
	matcher: (link: string) => /^https?:\/\//.test(link),
	attrs: {
		target: '_blank',
		rel: 'noopener',
	},
});

md.use(LinkPreview);

// @ts-expect-error markdown-exit type mismatch
md.use(GitHubAlerts);

md.use(Figures, {
	figcaption: true,
	lazy: true,
	async: true,
});

// @ts-expect-error markdown-exit type mismatch
md.use(MarkdownItCollapsible);

// @ts-expect-error markdown-exit type mismatch
md.use(Budoux({ language: 'ja' }));

// @ts-expect-error markdown-exit type mismatch
md.use(MarkdownItMagicLink, {
	linksMap: magicLinks,
});

// eslint-disable-next-line ts/no-unsafe-argument
md.use(MDC);

export { md };

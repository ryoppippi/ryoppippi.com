import { rendererRich, transformerTwoslash } from '@shikijs/twoslash';
import { createMarkdownExit } from 'markdown-exit';

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

import { codeToHtml } from 'shiki';

import { slugify } from '../lib/slugify.server.ts';
import { transformerEscape } from './shiki-transformer.ts';

const md = createMarkdownExit({
	html: true,
	linkify: true,
	typographer: true,
	async highlight(code, lang) {
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
	},
});

// @ts-expect-error markdown-exit type mismatch
md.use(anchor, {
	slugify,
	permalink: anchor.permalink.linkInsideHeader({
		symbol: '#',
		renderAttrs: () => ({ 'aria-hidden': 'true' }),
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

// eslint-disable-next-line ts/no-unsafe-argument
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
	linksMap: {
		'vim-jp': { link: 'https://vim-jp.org/', imageUrl: 'https://vim-jp.org/assets/images/vim2-128.png' },
		'vim-jp-radio': { link: 'https://vim-jp-radio.com/', imageUrl: 'https://cdn.jsdelivr.net/gh/vim-jp-radio/LP@main/src/assets/vimjp-radio-cover-art/800x800-fs8.png' },
		'Svelte Japan': { link: 'https://svelte.jp', imageUrl: 'https://cdn.jsdelivr.net/gh/sveltejs/branding/svelte-logo-square.png' },
		'ryoppippi.com': { link: 'https://ryoppippi.com', imageUrl: 'https://ryoppippi.com/ryoppippi.jpg' },
		'tech_world18': { link: 'https://x.com/tech_world18', imageUrl: 'https://pbs.twimg.com/profile_images/1717677089154088960/tDuRN0aB_400x400.jpg' },
		'TECH WORLD': { link: 'https://www.youtube.com/channel/UCISDrqLMNq3w9AZ4otdoRuA', imageUrl: 'https://pbs.twimg.com/profile_images/1920681519682908160/0sY6R8FJ_400x400.jpg' },
		'eerm16g': { link: 'https://x.com/eerm16g', imageUrl: 'https://pbs.twimg.com/profile_images/1959591256381927424/ULcgBpZx_400x400.jpg' },
	},
});

// eslint-disable-next-line ts/no-unsafe-argument
md.use(MDC);

export { md };

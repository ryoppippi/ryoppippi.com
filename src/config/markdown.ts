import type { OxContentOptions } from '@ox-content/vite-plugin';
import path from 'node:path';

const workspaceDirectory = path.resolve(import.meta.dirname, '../..');
export const twitterCacheDirectory = path.join(workspaceDirectory, '.cache/ox-content/twitter');
export const twitterMediaDirectory = path.join(workspaceDirectory, 'public/ox-content/twitter');

const magicLinkAliases = {
	'vim-jp': {
		href: 'https://vim-jp.org/',
		image: 'https://vim-jp.org/assets/images/vim2-128.png',
	},
	'vim-jp-radio': {
		href: 'https://vim-jp-radio.com/',
		image:
			'https://cdn.jsdelivr.net/gh/vim-jp-radio/LP@main/src/assets/vimjp-radio-cover-art/800x800-fs8.png',
	},
	'Svelte Japan': {
		href: 'https://svelte.jp',
		image: 'https://cdn.jsdelivr.net/gh/sveltejs/branding/svelte-logo-square.png',
	},
	'ryoppippi.com': {
		href: 'https://ryoppippi.com',
		image: 'https://ryoppippi.com/ryoppippi.jpg',
	},
	tech_world18: {
		href: 'https://x.com/tech_world18',
		image: 'https://pbs.twimg.com/profile_images/1717677089154088960/tDuRN0aB_400x400.jpg',
	},
	'TECH WORLD': {
		href: 'https://www.youtube.com/channel/UCISDrqLMNq3w9AZ4otdoRuA',
		image: 'https://pbs.twimg.com/profile_images/1920681519682908160/0sY6R8FJ_400x400.jpg',
	},
	Rork: {
		href: 'https://rork.com/',
		image: 'https://pbs.twimg.com/profile_images/2024413445236600832/nNHMz2Sc_bigger.jpg',
	},
	typia: {
		href: 'https://github.com/samchon/typia',
		image: 'https://github.com/samchon.png',
	},
	NeovimConf: {
		href: 'https://neovimconf.live/',
		image: 'https://github.com/neovim.png',
	},
	eerm16g: {
		href: 'https://x.com/eerm16g',
		image: 'https://pbs.twimg.com/profile_images/1959591256381927424/ULcgBpZx_400x400.jpg',
	},
} as const;

export const OX_MARKDOWN_OPTIONS = {
	attrs: true,
	budoux: true,
	embeds: false,
	frontmatter: false,
	headingPermalinks: true,
	highlight: true,
	images: true,
	containers: {
		types: {
			details: { tag: 'details' },
		},
	},
	magicLinks: {
		aliases: magicLinkAliases,
		favicon: { template: 'https://favicon.yandex.net/favicon/{host}' },
	},
	notByAi: true,
	ogViewer: false,
	search: false,
	semanticFootnotes: true,
	ssg: false,
	toc: false,
} as const satisfies OxContentOptions;

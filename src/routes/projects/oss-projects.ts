export type Genre = string;
export type Project = {
	name: string;
	link?: string;
	description?: string | null;
	icon: string;
};

export type Projects = Record<Genre, Project[]>;

export type GHRepo = {
	repo: {
		name: string;
		description: string | null;
		stars: number;
		watchers: number;
		forks: number;
		createdAt: string;
		pushedAt: string;
		updatedAt: string;
	};
};

// @unocss-include
export default {
	'Vim/Neovim': [
		{
			name: 'nvim-pnpm-catalog-lens',
			icon: 'i-catppuccin:pnpm?mask',
		},
		{
			name: 'vim-bun-lock',
			icon: 'i-catppuccin:bun',
		},
		{
			name: 'vim-ray-so',
			icon: 'i-ph:camera-light',
		},
		{
			name: 'vim-svelte-inspector',
			icon: 'i-material-symbols-light:frame-inspect-rounded',
		},
		{
			name: 'nvim-reset',
			icon: 'i-system-uicons:reset-alt',
		},
		{
			name: 'vim-bad-apple',
			icon: 'i-hugeicons:apple-01',
		},
	],
	'Svelte Ecosystem': [
		{
			name: 'sveltweet',
			icon: 'i-ph:twitter-logo',
		},
		{
			name: 'svelte-preprocess-budoux',
			icon: 'i-tabler:language-hiragana',
		},
		{
			name: 'svelte-html-event',
			icon: 'i-ph:ticket-light',
		},
		{
			name: 'svelte-preprocess-import-css',
			icon: 'i-ph:palette-light',
		},
	],
	'TypeScript Ecosystem': [
		{
			name: 'unplugin-typia',
			icon: 'i-ph:magic-wand-light',
		},
		{
			name: 'vite-plugin-favicons',
			icon: 'i-tabler:favicon',
		},
		{
			name: 'slidev-transformer-budoux',
			icon: 'i-tabler:language-hiragana',
		},
		{
			name: 'typiautil',
			icon: 'i-ph:toolbox-light',
		},
		{
			name: 'pkg-to-jsr',
			icon: 'i-ph:selection-foreground-light',
		},
		{
			name: 'mirror-jsr-to-npm',
			icon: 'i-octicon:mirror',
		},
		{
			name: 'bun-plugin-isolated-decl',
			icon: 'i-ph:package',
		},
		{
			name: 'bunpare',
			icon: 'i-icon-park-outline:setting-config',
		},
	],
	'TypeScript Libraries': [
		{
			name: 'limo',
			icon: 'i-material-symbols:edit-document-outline',
		},
		{
			name: 'str-fns',
			icon: 'i-oui:app-devtools',
		},
	],
	'CLI': [
		{
			name: 'curxy',
			icon: 'i-solar:cursor-square-broken',
		},
		{
			name: 'nyancat.zig',
			icon: 'i-solar:cat-broken',
		},
		{
			name: 'zigchat',
			icon: 'i-ph:chat-light',
		},
	],
	'Fish Plugins': [
		{
			name: 'fish-na',
			icon: 'i-ph:package',
		},
		{
			name: 'fish-poetry',
			icon: 'i-teenyicons:python-outline',
		},
	],
	'Zig Ecosystem': [
		{
			name: 'zigcv',
			link: 'https://github.com/zigcv/zigcv',
			icon: 'i-file-icons:opencv',
		},
	],
	'Configs': [
		{
			name: 'dotfiles',
			icon: 'i-catppuccin:folder-config?mask',
		},
	],
} as const satisfies Record<Genre, Project[ ]>;

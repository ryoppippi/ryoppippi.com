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

export default {
	'vim/neovim': [
		{
			name: 'dotfiles',
			icon: 'i-icon-park-outline:config',
		},
		{
			name: 'nvim-pnpm-catalog-lens',
			icon: 'i-catppuccin:pnpm?mask',
		},
		{
			name: 'nvim-reset',
			icon: 'i-system-uicons:reset-alt',
		},
		{
			name: 'vim-ray-so',
			icon: 'i-material-symbols:android-camera-outline',
		},
		{
			name: 'vim-bad-apple',
			icon: 'i-hugeicons:apple-01',
		},
		{
			name: 'vim-svelte-inspector',
			icon: 'i-material-symbols-light:frame-inspect-rounded',
		},
	],
	'typescript ecosystems': [
		{
			name: 'unplugin-typia',
			icon: 'i-pajamas:issue-type-enhancement',
		},
		{
			name: 'vite-plugin-favicons',
			icon: 'i-tabler:favicon',
		},
		{
			name: 'typiautil ',
			icon: 'i-tabler:favicon', // TODO
		},
	],
	'svelte ecosystem': [
		{
			name: 'sveltweet',
			icon: 'i-ph:twitter-logo-fill',
		},
		{
			name: 'svelte-preprocess-budoux',
			icon: 'i-tabler:language-hiragana',
		},
		{
			name: 'svelte-html-event',
			icon: 'i-simple-icons:svelte',
		},
		{
			name: 'svelte-preprocess-import-css',
			icon: 'i-catppuccin:svelte-config?mask',
		},
	],
	'typescript build': [
		{
			name: 'limo',
			icon: 'i-material-symbols:edit-document-outline',
		},
		{
			name: 'str-fns',
			icon: 'i-oui:app-devtools',
		},
	],
	'cli': [
		{
			name: 'curxy',
			icon: 'i-solar:cursor-square-broken',
		},
		{
			name: 'pkg-to-jsr',
			icon: 'i-material-symbols:edit-document-outline-sharp',
		},
		{
			name: 'mirror-jsr-to-npm',
			icon: 'i-octicon:mirror',
		},
		{
			name: 'nyancat.zig',
			icon: 'i-solar:cat-broken',
		},
		{
			name: 'na.fish',
			icon: 'i-codicon:package',
		},
		{
			name: 'bunpare',
			icon: 'i-icon-park-outline:setting-config',
		},
	],
	'misc': [
		{
			name: 'zigcv',
			link: 'https://github.com/zigcv/zigcv',
			icon: 'i-file-icons:opencv',
		},
	],
} as const satisfies Record<Genre, Project[ ]>;

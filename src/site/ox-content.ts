import {
	planSsgOutputs,
	resolveSelfHostedAssetManifest,
	type OxContentOptions,
} from '@ox-content/vite-plugin';
import { Route } from '../../routes.ts';
import { OPEN_GRAPH_OPTIONS } from '../content/markdown/open-graph.ts';
import { BLOG_FEED_OPTIONS } from './feeds.ts';

export const BLOG_COLLECTION_PATTERNS = ['*.md', '*.mdx', '*/index.md', '*/index.mdx'] as const;

const redirects = [...Route, { from: '/works', to: '/works/oss', status: 301 }] as const;
const redirectMap = Object.fromEntries(redirects.map(({ from, to }) => [from, to]));

export const OX_CONTENT_BUILD_OPTIONS = {
	attrs: true,
	budoux: true,
	srcDir: 'src/content/blog',
	outDir: 'build',
	collections: { blog: BLOG_COLLECTION_PATTERNS },
	docs: false,
	icons: {
		include: [
			'carbon:checkbox',
			'carbon:checkbox-checked',
			'file-icons:opencv',
			'hugeicons:apple-01',
			'line-md:download-outline',
			'line-md:github-loop',
			'line-md:linkedin',
			'line-md:moon-filled-to-sunny-filled-loop-transition',
			'line-md:rss',
			'line-md:sunny-filled-loop-to-moon-filled-transition',
			'line-md:twitter',
			'material-symbols:edit-document-outline',
			'material-symbols-light:frame-inspect-rounded',
			'oui:app-devtools',
			'ph:bell-ringing-light',
			'ph:chart-line-light',
			'ph:file-text-light',
			'ph:folder-simple',
			'ph:git-pull-request-duotone',
			'ph:github-logo-duotone',
			'ph:globe-hemisphere-west-light',
			'ph:graduation-cap-light',
			'ph:heart',
			'ph:key-light',
			'ph:moon-stars-light',
			'ph:package',
			'ph:palette-light',
			'ph:robot-light',
			'ph:star',
			'ph:twitter-logo',
			'quill:link-out',
			'ri:markdown-line',
			'ri:mic-line',
			'ri:youtube-line',
			'simple-icons:bluesky',
			'simple-icons:markdown',
			'simple-icons:neovim',
			'simple-icons:nixos',
			'simple-icons:pnpm',
			'solar:cat-broken',
			'solar:cloud-download-line-duotone',
			'solar:cursor-square-broken',
			'system-uicons:reset-alt',
			'tabler:favicon',
			'tabler:language-hiragana',
			'teenyicons:github-solid',
		],
	},
	embeds: {
		openGraph: OPEN_GRAPH_OPTIONS,
	},
	feeds: BLOG_FEED_OPTIONS,
	permalinks: true,
	notByAi: true,
	redirects: {
		allowExternal: true,
		html: false,
		map: redirectMap,
		provider: 'cloudflare',
	},
	ssg: {
		bare: true,
		markdownSource: { alternate: true },
		siteName: 'blog | ryoppippi.com',
		siteUrl: 'https://ryoppippi.com',
		transformConcurrency: 4,
		theme: {
			fonts: {
				sans: {
					family: 'Inter',
					provider: 'local',
					path: '@fontsource/inter',
					weights: [400, 600, 800],
					selfHost: true,
				},
				mono: {
					family: 'DM Mono',
					provider: 'local',
					path: '@fontsource/dm-mono',
					weights: [400, 500],
					selfHost: true,
				},
				named: {
					code: {
						family: 'JetBrains Mono',
						provider: 'local',
						path: '@fontsource/jetbrains-mono',
						weights: [400, 600],
						selfHost: true,
					},
					condensed: {
						family: 'Roboto Condensed',
						provider: 'local',
						path: '@fontsource/roboto-condensed',
						weights: [400, 700],
						selfHost: true,
					},
				},
			},
		},
	},
	search: false,
} as const satisfies OxContentOptions;

const oxContentOutputPlan = planSsgOutputs({
	outDir: OX_CONTENT_BUILD_OPTIONS.outDir,
	root: process.cwd(),
	srcDir: OX_CONTENT_BUILD_OPTIONS.srcDir,
	options: OX_CONTENT_BUILD_OPTIONS,
	pages: [],
});

export const OX_CONTENT_ASSET_MANIFEST = resolveSelfHostedAssetManifest(
	oxContentOutputPlan.selfHostedAssets.options,
);

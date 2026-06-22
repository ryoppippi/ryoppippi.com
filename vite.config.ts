import { oxContentSvelte } from '@ox-content/vite-plugin-svelte';
import { cloudflareRedirect } from '@ryoppippi/vite-plugin-cloudflare-redirect';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { FontaineTransform } from 'fontaine';
import { defineConfig } from 'vite-plus';
import { Route } from './routes.ts';
import { staticSiteBuild } from './src/site/build-plugin.ts';
import { staticSiteDevServer } from './src/site/dev-server.ts';

export default defineConfig({
	publicDir: 'static',
	server: {
		watch: {
			ignored: ['**/.direnv/**'],
		},
	},
	plugins: [
		svelte(),
		cloudflareRedirect({
			mode: 'generate',
			entries: [...Route, { from: '/works', to: '/works/oss', status: 301 }],
		}),
		...oxContentSvelte({
			components: { Tweet: './packages/content/src/Tweet.svelte' },
			srcDir: 'packages/content/src/blog',
			ssg: false,
		}),
		staticSiteBuild(),
		staticSiteDevServer(),
		FontaineTransform.vite({
			fallbacks: {
				'DM Mono': ['Courier New'],
				Inter: ['Arial'],
				'JetBrains Mono': ['Courier New'],
				'Roboto Condensed': ['Arial'],
			},
			resolvePath: (id) => new URL(import.meta.resolve(id)),
		}),
		tailwindcss(),
	],
	build: {
		outDir: 'build',
		emptyOutDir: true,
		manifest: true,
	},
	run: {
		tasks: {
			'site-build': {
				command: 'vp build',
				dependsOn: ['@ryoppippi/content#build'],
				input: [
					'package.json',
					'pnpm-lock.yaml',
					'tsconfig.json',
					'vite.config.ts',
					'routes.ts',
					'scripts/**',
					'src/**',
					'packages/content/dist/**',
					'packages/content/article.css',
					'packages/content/package.json',
					'packages/content/src/**',
					'!packages/content/src/**/*.md',
					'static/**',
				],
				output: ['build/**'],
			},
		},
	},
	fmt: {
		ignorePatterns: [
			'.claude/**',
			'.codex/**',
			'.direnv/**',
			'build/**',
			'node_modules/**',
			'src/contents/**',
			'packages/content/src/blog/**',
			'packages/content/src/showcase/**',
			'static/**',
		],
		singleQuote: true,
		sortPackageJson: true,
		useTabs: true,
	},
	lint: {
		ignorePatterns: [
			'.claude/**',
			'.codex/**',
			'.direnv/**',
			'build/**',
			'node_modules/**',
			'src/contents/**',
			'packages/content/src/blog/**',
			'packages/content/src/showcase/**',
			'static/**',
		],
		options: {
			typeAware: true,
			typeCheck: true,
		},
	},
	staged: {
		'*.{css,js,json,svelte,ts,yaml,yml}': 'vp check --fix',
	},
	test: {
		globals: true,
		environment: 'node',
		includeSource: [
			'src/lib/**/*.ts',
			'src/site/{assets,content-assets,dev-routes,dev-server,page-styles}.ts',
			'packages/content/src/{artifact,blog,ogp-snapshots,paths,tweet-snapshots}.ts',
			'packages/content/src/markdown/**/*.ts',
		],
	},
});

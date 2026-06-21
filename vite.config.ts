import { oxContentSvelte } from '@ox-content/vite-plugin-svelte';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite-plus';
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
		...oxContentSvelte({
			components: { Tweet: './src/site/Tweet.svelte' },
			srcDir: 'src/contents/blog',
			ssg: false,
		}),
		staticSiteBuild(),
		staticSiteDevServer(),
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
				input: [
					'package.json',
					'pnpm-lock.yaml',
					'tsconfig.json',
					'vite.config.ts',
					'routes.ts',
					'font-assets.ts',
					'scripts/**',
					'src/**',
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
		includeSource: ['src/lib/**/*.ts', 'src/markdown/**/*.ts'],
	},
});

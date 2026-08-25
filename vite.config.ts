import { oxContentSvelte } from '@ox-content/vite-plugin-svelte';
import { svelteRootDir } from '@ryoppippi/content/paths';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { FontaineTransform } from 'fontaine';
import { defineConfig, type PluginOption } from 'vite-plus';
import solid from 'vite-plugin-solid';
import { staticSiteBuild } from './src/site/build-plugin.ts';
import { staticSiteDevServer } from './src/site/dev-server.ts';
import { oxContentBuildPlugins } from './src/site/ox-content.ts';

export default defineConfig(({ command, mode }) => ({
	publicDir: 'static',
	envPrefix: ['PUBLIC_', 'VITE_'],
	server: {
		watch: {
			ignored: ['**/.direnv/**'],
		},
	},
	plugins: [
		svelte({ compilerOptions: { rootDir: svelteRootDir() } }),
		solid({ ssr: true, solid: { hydratable: false } }),
		...oxContentSvelte({
			srcDir: 'packages/content/src/blog',
		}),
		...(command === 'build' && mode !== 'test' ? oxContentBuildPlugins() : []),
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
	] satisfies PluginOption[],
	build: {
		outDir: 'build',
		emptyOutDir: true,
		manifest: true,
	},
	run: {
		tasks: {
			'git-history': {
				command:
					'sh -c \'if [ "$CI" = true ] && [ "$(git rev-parse --is-shallow-repository 2>/dev/null || echo false)" = true ]; then git fetch --unshallow origin; fi\'',
				cache: false,
			},
			'site-build': {
				command: 'PUBLIC_ORIGIN="${PUBLIC_ORIGIN:-https://ryoppippi.com}" vp build',
				dependsOn: ['git-history', '@ryoppippi/content#build'],
				env: ['PUBLIC_ORIGIN', 'CI'],
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
					'!packages/content/src/**/*.mdx',
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
		// gitleaks scans the whole staged diff itself, so no file arguments
		'*': () => 'gitleaks protect --staged --config .gitleaks.toml',
	},
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: 'node',
					globals: true,
					environment: 'node',
					includeSource: [
						'src/lib/**/*.ts',
						'src/site/{assets,content-assets,dev-routes,dev-server}.ts',
						'src/site/{generate,page-styles,pages,sitemap}.ts',
						'packages/content/src/{artifact,blog,island-renderer,islands,markdown-cache,paths}.ts',
						'packages/content/src/blog/**/*.ts',
						'packages/content/src/markdown/**/*.ts',
					],
				},
			},
		],
	},
}));

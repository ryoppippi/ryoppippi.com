import { kanagawaDragon } from '@ox-content/theme-color-kanagawa';
import { oxContent } from '@ox-content/vite-plugin';
import solid from '@solidjs/vite-plugin';
import { playwright } from '@vitest/browser-playwright';
import { configDefaults } from 'vitest/config';
import { defineConfig, type PluginOption } from 'vite-plus';
import { staticSiteBuild } from './src/site/build-plugin.ts';
import { staticSiteDevServer } from './src/site/dev-server.ts';
import { OX_CONTENT_BUILD_OPTIONS } from './src/site/ox-content.ts';
import { syntaxThemeStylesheet } from './src/site/syntax-theme.ts';

export default defineConfig(({ command, mode }) => ({
	publicDir: 'static',
	envPrefix: ['PUBLIC_', 'VITE_'],
	resolve: {
		tsconfigPaths: true,
	},
	server: {
		watch: {
			ignored: ['**/.direnv/**'],
		},
	},
	plugins: [
		syntaxThemeStylesheet('/src/site/pages/blog/article/ArticleContent.css', kanagawaDragon),
		solid({ compiler: 'native', ssr: command === 'serve', solid: { hydratable: false } }),
		...oxContent({
			...OX_CONTENT_BUILD_OPTIONS,
			icons: mode === 'test' ? false : OX_CONTENT_BUILD_OPTIONS.icons,
			ssg:
				mode === 'test'
					? false
					: command === 'build'
						? OX_CONTENT_BUILD_OPTIONS.ssg
						: { ...OX_CONTENT_BUILD_OPTIONS.ssg, enabled: false },
		}),
		staticSiteBuild(),
		staticSiteDevServer(),
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
				dependsOn: ['git-history'],
				env: ['PUBLIC_ORIGIN', 'CI'],
				input: [
					'package.json',
					'pnpm-lock.yaml',
					'tsconfig.json',
					'vite.config.ts',
					'scripts/**',
					'src/**',
					{ pattern: '.cache/ox-content/twitter/**', base: 'workspace' },
					'static/**',
				],
				output: ['build/**'],
			},
		},
	},
	fmt: {
		ignorePatterns: [
			'.cache/**',
			'.claude/**',
			'.codex/**',
			'.direnv/**',
			'build/**',
			'node_modules/**',
			'src/contents/**',
			'src/content/blog/**',
			'src/content/showcase/**',
			'static/**',
		],
		singleQuote: true,
		sortPackageJson: true,
		useTabs: true,
	},
	lint: {
		ignorePatterns: [
			'.cache/**',
			'.claude/**',
			'.codex/**',
			'.direnv/**',
			'build/**',
			'node_modules/**',
			'src/contents/**',
			'src/content/blog/**',
			'src/content/showcase/**',
			'static/**',
		],
		options: {
			typeAware: true,
			typeCheck: true,
		},
	},
	staged: {
		'*.{css,js,json,ts,tsx,yaml,yml}': 'vp check --fix',
		// gitleaks scans the whole staged diff itself, so no file arguments
		'*': () => 'gitleaks protect --staged --config .gitleaks.toml',
	},
	test: {
		environment: 'node',
		projects: [
			{
				extends: true,
				test: {
					name: 'node',
					globals: true,
					environment: 'node',
					exclude: [...configDefaults.exclude, '**/.direnv/**', '**/*.browser.test.{ts,tsx}'],
					includeSource: [
						'src/lib/**/*.ts',
						'src/site/{assets,content-assets,dev-routes,dev-server}.ts',
						'src/site/{generate,page-style-loader,syntax-theme}.ts',
						'src/site/pages/**/*.ts',
						'src/content/{artifact,blog,island-renderer,islands,paths}.ts',
						'src/content/blog/**/*.ts',
						'src/content/markdown/**/*.ts',
					],
				},
			},
			{
				extends: true,
				test: {
					name: 'browser',
					globals: true,
					include: ['src/**/*.browser.test.ts'],
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({
							contextOptions: {
								permissions: ['clipboard-read', 'clipboard-write'],
							},
						}),
						instances: [{ browser: 'chromium' }],
					},
				},
			},
		],
	},
}));

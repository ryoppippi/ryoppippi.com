import { kanagawaDragon } from '@ox-content/theme-color-kanagawa';
import { oxContent } from '@ox-content/vite-plugin';
import { createOxContentCustomHostPlugin } from '@ox-content/vite-plugin/custom-host';
import { createSolidHtmlHostIslandRegistry } from '@ox-content/vite-plugin-solid';
import path from 'node:path';
import solid from '@solidjs/vite-plugin';
import { playwright } from '@vitest/browser-playwright';
import { configDefaults } from 'vitest/config';
import { defineConfig, type PluginOption } from 'vite-plus';
import { OX_CONTENT_BUILD_OPTIONS, SYNTAX_THEME_HREF } from './src/config/ox-content.ts';
import { loadIslandDocuments } from './src/content/islands.ts';
import { createStaticSiteDevelopmentPlugin } from './vite-plugin.ts';

export default defineConfig(({ command, mode }) => ({
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
		createSolidHtmlHostIslandRegistry({
			oxContent: OX_CONTENT_BUILD_OPTIONS,
			watch: ['src/content/blog'],
			documents: ({ root, command }) =>
				loadIslandDocuments(path.join(root, 'src/content/blog'), {
					includeDrafts: command === 'serve',
				}),
		}).plugin,
		solid({ compiler: 'native', ssr: command === 'serve', solid: { hydratable: false } }),
		...oxContent({
			...OX_CONTENT_BUILD_OPTIONS,
			icons: mode === 'test' ? false : OX_CONTENT_BUILD_OPTIONS.icons,
			ssg: mode === 'test' ? false : { ...OX_CONTENT_BUILD_OPTIONS.ssg, enabled: false },
		}),
		createStaticSiteDevelopmentPlugin(),
		createOxContentCustomHostPlugin({
			// Development page routes remain in the existing middleware during migration.
			host: command === 'serve' ? { routes: [] } : '/src/generation/index.ts',
			themeTokens: {
				theme: kanagawaDragon,
				include: (name) => name.startsWith('syntax-'),
				href: SYNTAX_THEME_HREF,
			},
			build: { transformHtml: false },
			// Site-owned auxiliary output policy is still supplied by the generator.
			oxContent: {
				ssg: false,
				icons: false,
				feeds: false,
				siteMaps: false,
				resources: false,
				redirects: false,
			},
		}),
	] satisfies PluginOption[],
	build: {
		outDir: 'build',
		emptyOutDir: true,
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
					'vite-plugin.ts',
					'src/**',
					{ pattern: '.cache/ox-content/twitter/**', base: 'workspace' },
					'public/**',
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
			'public/**',
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
			'public/**',
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
						'vite-plugin.ts',
						'src/client/page-style-loader.ts',
						'src/contents/{external-content,works-data}.ts',
						'src/dev-server/**/*.ts',
						'src/generation/**/*.ts',
						'src/lib/**/*.ts',
						'src/pages/**/*.ts',
						'src/rendering/site-assets.ts',
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

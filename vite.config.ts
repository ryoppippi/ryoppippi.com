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
import { SERVER_STYLE_MODULES } from './src/client/page-style-registry.ts';
import { loadIslandDocuments } from './src/content/islands.ts';
import { planSiteContentAssets } from './src/generation/content-assets.ts';

type BlogCatalogueModule = {
	loadBlogPostMetadata: () => Promise<Array<{ filename: string; isPublished: boolean }>>;
};

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
		createOxContentCustomHostPlugin({
			host: command === 'serve' ? '/src/dev-server/index.ts' : '/src/generation/index.ts',
			dev: {
				enabled: mode !== 'test',
				routeDependencies: [
					{ path: 'src/content/blog', kind: 'directory' },
					{ path: 'src/pages', kind: 'directory' },
				],
			},
			collectionAssets: {
				async manifest(context) {
					const publishedPosts =
						context.mode === 'serve'
							? undefined
							: new Set(
									(
										await (
											(await context.loadModule('/src/content/blog.ts')) as BlogCatalogueModule
										).loadBlogPostMetadata()
									)
										.filter(({ isPublished }) => isPublished)
										.map(({ filename }) => filename),
								);
					return planSiteContentAssets(context.root, publishedPosts);
				},
				watch: [
					{ path: 'src/content/blog', kind: 'directory' },
					{ path: 'src/content/works/showcase', kind: 'directory' },
				],
				ownedPrefixes: ['/assets/content', '/works/showcase/assets'],
			},
			themeTokens: {
				theme: kanagawaDragon,
				include: (name) => name.startsWith('syntax-'),
				href: SYNTAX_THEME_HREF,
			},
			build: { transformHtml: false },
			oxContent: {
				...OX_CONTENT_BUILD_OPTIONS,
				feeds: OX_CONTENT_BUILD_OPTIONS.feeds,
				siteMaps: { robots: false, llms: false },
				resources: false,
				redirects: OX_CONTENT_BUILD_OPTIONS.redirects,
			},
		}),
	] satisfies PluginOption[],
	build: {
		cssMinify: true,
		outDir: 'dist',
		emptyOutDir: true,
		minify: true,
		rollupOptions: { input: ['index.html', ...SERVER_STYLE_MODULES] },
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
					'src/**',
					{ pattern: '.cache/ox-content/twitter/**', base: 'workspace' },
					'public/**',
				],
				output: ['dist/**'],
			},
		},
	},
	fmt: {
		ignorePatterns: [
			'.cache/**',
			'.claude/**',
			'.codex/**',
			'.direnv/**',
			'dist/**',
			'node_modules/**',
			'src/content/blog/**',
			'src/content/works/**',
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
			'dist/**',
			'node_modules/**',
			'src/content/blog/**',
			'src/content/works/**',
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
						'src/config/ox-content.ts',
						'src/content/{external-content,works-data}.ts',
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

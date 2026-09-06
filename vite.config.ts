import { kanagawaDragon } from '@ox-content/theme-color-kanagawa';
import { oxContent } from '@ox-content/vite-plugin';
import { createMarkdownDevPlugin } from './src/ox-content/dev-plugin.ts';
import {
	createOxContentCustomHostPlugin,
	type OxContentCustomHostOptions,
} from '@ox-content/vite-plugin/custom-host';
import { createSolidHtmlHostIslandRegistry } from '@ox-content/vite-plugin-solid';
import path from 'node:path';
import solid from '@solidjs/vite-plugin';
import { playwright } from '@vitest/browser-playwright';
import { configDefaults } from 'vitest/config';
import { defineConfig, type PluginOption } from 'vite-plus';
import { OX_CONTENT_BUILD_OPTIONS, SYNTAX_THEME_HREF } from './src/config/ox-content.ts';
import { ssrStylesPlugin } from './src/ox-content/ssr-styles-plugin.ts';
import { loadIslandDocuments } from './src/pages/blog/island-documents.ts';
import { planSiteContentAssets } from './src/pages/content-assets.ts';

type BlogCatalogueModule = {
	loadBlogPostMetadata: () => Promise<Array<{ filename: string; isPublished: boolean }>>;
};

export default defineConfig(({ command, mode }) => {
	const hostOptions = {
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
										(await context.loadModule('/src/pages/blog/data.ts')) as BlogCatalogueModule
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
	} satisfies Omit<OxContentCustomHostOptions, 'host'>;
	return {
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
			ssrStylesPlugin({ pages: 'src/pages', layout: 'src/components/SiteLayout/index.tsx' }),
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
			command === 'serve'
				? createMarkdownDevPlugin({
						...hostOptions,
						host: '/src/pages/dev.ts',
						markdownModule: '/src/ox-content/markdown.ts',
						islandRendererModule: '/src/ox-content/island-renderer.ts',
					})
				: createOxContentCustomHostPlugin({ ...hostOptions, host: '/src/pages/build.ts' }),
		] satisfies PluginOption[],
		build: {
			cssMinify: true,
			outDir: 'dist',
			emptyOutDir: true,
			minify: true,
			rollupOptions: { input: ['index.html'] },
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
						includeSource: ['src/**/*.ts'],
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
	};
});

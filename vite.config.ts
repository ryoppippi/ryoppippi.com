import { kanagawaDragon } from '@ox-content/theme-color-kanagawa';
import { oxContent } from '@ox-content/vite-plugin';
import {
	createOxContentCustomHostPlugin,
	type OxContentCustomHostOptions,
} from '@ox-content/vite-plugin/custom-host';
import { createSolidHtmlHostIslandRegistry } from '@ox-content/vite-plugin-solid';
import solid from '@solidjs/vite-plugin';
import { configDefaults } from 'vitest/config';
import { defineConfig, type PluginOption } from 'vite-plus';
import { OX_CONTENT_BUILD_OPTIONS, SYNTAX_THEME_HREF } from './src/config/ox-content.ts';
import { planSiteContentAssets } from './src/utils/ssg/content-assets.ts';
import { BLOG_ISLAND_DOCUMENTS } from './src/pages/blog/island-documents.ts';

export default defineConfig(({ command, mode }) => {
	const hostOptions = {
		ssrStylesheets: {
			modules: ['src/pages/**/*.tsx', '/src/components/SiteLayout/index.tsx'],
		},
		dev: {
			enabled: mode !== 'test',
			feedOutputs: true,
			routeDependencies: [
				{ path: 'src/content', kind: 'directory' },
				{ path: 'src/pages', kind: 'directory' },
				{ path: 'src/utils/ssg', kind: 'directory' },
			],
		},
		collectionAssets: {
			manifest: ({ root, mode }) =>
				planSiteContentAssets(root, mode === 'serve' ? 'serve' : 'build'),
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
			siteMaps: { robots: false, llms: false },
			resources: false,
		},
	} satisfies Omit<OxContentCustomHostOptions, 'host'>;
	return {
		appType: 'mpa',
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
				oxContent: { ...OX_CONTENT_BUILD_OPTIONS, embeds: false },
				collectionDocuments: BLOG_ISLAND_DOCUMENTS,
			}).plugin,
			solid({ compiler: 'native', ssr: command === 'serve', solid: { hydratable: false } }),
			...oxContent({
				...OX_CONTENT_BUILD_OPTIONS,
				icons: mode === 'test' ? false : OX_CONTENT_BUILD_OPTIONS.icons,
				ssg: mode === 'test' ? false : { ...OX_CONTENT_BUILD_OPTIONS.ssg, enabled: false },
			}),
			createOxContentCustomHostPlugin({
				...hostOptions,
				host: command === 'serve' ? '/src/utils/ssg/dev.ts' : '/src/utils/ssg/build.ts',
			}),
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
			globals: true,
			exclude: [...configDefaults.exclude, '**/.direnv/**'],
			includeSource: ['src/**/*.ts'],
		},
	};
});

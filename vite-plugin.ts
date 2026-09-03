import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { renderThemeTokenCss, type ThemeTokenSource } from '@ox-content/vite-plugin/theme-tokens';
import path from 'node:path';
import { createServer } from 'vite';

type StaticSiteBuildModule = {
	buildStaticSite: (options: {
		loadModule: (modulePath: string) => Promise<unknown>;
		outDir: string;
		root: string;
	}) => Promise<void>;
};

type StaticSiteDevelopmentModule = {
	configureStaticSiteDevelopmentServer: (server: ViteDevServer) => Promise<void>;
};

async function runStaticSiteBuild(config: ResolvedConfig): Promise<void> {
	const root = config.root;
	const moduleServer = await createServer({
		appType: 'custom',
		configFile: config.configFile ?? path.join(root, 'vite.config.ts'),
		optimizeDeps: { noDiscovery: true },
		server: { middlewareMode: true },
	});

	try {
		const { buildStaticSite } = (await moduleServer.ssrLoadModule(
			'/src/generation/index.ts',
		)) as StaticSiteBuildModule;
		await buildStaticSite({
			loadModule: (modulePath) => moduleServer.ssrLoadModule(modulePath),
			outDir: path.resolve(root, config.build.outDir),
			root,
		});
	} finally {
		await moduleServer.close();
	}
}

/**
 * Renders the syntax tokens from an Ox Content color theme for the custom site design.
 *
 * @param theme - An Ox Content theme containing light and dark syntax tokens.
 * @returns CSS variables matching the theme switch contract used by Ox Content.
 */
export function renderSyntaxThemeCss(theme: ThemeTokenSource): string {
	return renderThemeTokenCss(theme, {
		include: (name) => name.startsWith('syntax-'),
	});
}

/**
 * Appends an Ox Content color theme to an existing Vite stylesheet.
 *
 * @param stylesheetPath - Repository-relative stylesheet path to extend.
 * @param theme - Ox Content color theme whose syntax tokens should be exposed.
 * @returns A Vite plugin adding the generated token declarations.
 */
export function createSyntaxThemeStylesheetPlugin(
	stylesheetPath: string,
	theme: ThemeTokenSource,
): Plugin {
	const normalizedPath = stylesheetPath.replaceAll('\\', '/');
	const css = renderSyntaxThemeCss(theme);
	return {
		name: 'syntax-theme-stylesheet',
		transform(code, id) {
			const cleanId = id.split('?', 1)[0].replaceAll('\\', '/');
			return cleanId.endsWith(normalizedPath) ? `${code}\n${css}` : undefined;
		},
	};
}

/**
 * Integrates the custom static site with Vite's development and build lifecycles.
 *
 * @returns The Vite plugin that connects site rendering to Vite.
 */
export function createStaticSitePlugin(): Plugin {
	let resolvedConfig: ResolvedConfig | undefined;
	let staticSiteBuild: Promise<void> | undefined;

	return {
		name: 'ryoppippi-static-site',
		apply: (_config, { mode }) => mode !== 'test',
		applyToEnvironment: (environment) => environment.name === 'client',
		configResolved(config) {
			resolvedConfig = config;
		},
		async configureServer(server) {
			const { configureStaticSiteDevelopmentServer } = (await server.ssrLoadModule(
				'/src/dev-server/index.ts',
			)) as StaticSiteDevelopmentModule;
			await configureStaticSiteDevelopmentServer(server);
		},
		async closeBundle() {
			if (resolvedConfig?.command !== 'build') {
				return;
			}
			staticSiteBuild ??= runStaticSiteBuild(resolvedConfig);
			await staticSiteBuild;
		},
	};
}

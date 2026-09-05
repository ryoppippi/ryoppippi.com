import type { Plugin, ViteDevServer } from 'vite';
import { renderThemeTokenCss, type ThemeTokenSource } from '@ox-content/vite-plugin/theme-tokens';

type StaticSiteDevelopmentModule = {
	configureStaticSiteDevelopmentServer: (server: ViteDevServer) => Promise<void>;
};

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
 * Connects the remaining development middleware to Vite.
 *
 * @returns The Vite plugin that connects site rendering to Vite.
 */
export function createStaticSiteDevelopmentPlugin(): Plugin {
	return {
		name: 'ryoppippi-static-site',
		apply: (_config, { mode }) => mode !== 'test',
		applyToEnvironment: (environment) => environment.name === 'client',
		async configureServer(server) {
			const { configureStaticSiteDevelopmentServer } = (await server.ssrLoadModule(
				'/src/dev-server/index.ts',
			)) as StaticSiteDevelopmentModule;
			await configureStaticSiteDevelopmentServer(server);
		},
	};
}

import { renderThemeTokenCss, type ThemeTokenSource } from '@ox-content/vite-plugin/theme-tokens';
import type { Plugin } from 'vite';

/**
 * Renders the syntax tokens from an Ox Content color theme for a custom site shell.
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
export function syntaxThemeStylesheet(stylesheetPath: string, theme: ThemeTokenSource): Plugin {
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

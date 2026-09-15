import type { ThemeBootstrapOptions } from '@ox-content/vite-plugin/theme-bootstrap';

/**
 * Shared first-paint and toggle settings keep document colours in sync.
 * Mirror the body backgrounds in src/styles/site.css before that stylesheet loads.
 */
export const THEME_BOOTSTRAP_OPTIONS = {
	defaultPreference: 'dark',
	documentColors: {
		light: { background: '#ffffff' },
		dark: { background: '#0f0f0f' },
	},
} as const satisfies ThemeBootstrapOptions;

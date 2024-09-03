import { isDevelopment } from 'std-env';
import { deepMerge } from '@std/collections/deep-merge';
import {
	defineConfig,
	presetAttributify,
	presetIcons,
	presetUno,
	transformerDirectives,
	transformerVariantGroup,
} from 'unocss';

export default defineConfig({
	presets: [
		presetUno(),
		presetAttributify(),
		presetIcons({ autoInstall: isDevelopment }),
	],
	transformers: [
		transformerDirectives(),
		transformerVariantGroup(),
	],
	extendTheme: theme => deepMerge(
		theme,
		{
			colors: {
				primary: {
					100: '#FF6B6B',
					200: '#dd4d51',
					300: '#8f001a',
				},
				accent: {
					100: '#FFE66D',
					200: '#958500',
				},
				text: {
					100: '#FFFFFF',
					200: '#e0e0e0',
				},
				bg: {
					base: '#0F0F0F',
					100: '#1E1E1E',
					200: '#2d2d2d',
					300: '#454545',
				},
			},
			breakpoints: {
				tiny: '375px',
			},
		},
	),
	rules: [
	],
	shortcuts: {
		fcol: 'flex flex-col',
	},
});

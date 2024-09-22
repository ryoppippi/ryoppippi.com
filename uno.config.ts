import { isDevelopment } from 'std-env';
import { deepMerge } from '@std/collections/deep-merge';
import {
	defineConfig,
	presetAttributify,
	presetIcons,
	presetTypography,
	presetUno,
	transformerDirectives,
	transformerVariantGroup,
} from 'unocss';

export default defineConfig({
	presets: [
		presetUno(),
		presetAttributify(),
		presetIcons({ autoInstall: isDevelopment }),
		presetTypography(),
	],
	transformers: [
		transformerDirectives(),
		transformerVariantGroup(),
	],
	content: {
		pipeline: {
			exclude: [
				/~icons/,
				/svelte-meta-tags/,
			],
		},
	},
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
					300: '#b3b3b3',
					400: '#808080',
					500: '#4d4d4d',
					600: '#262626',
					700: '#1a1a1a',
					800: '#0f0f0f',
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
		'fcol': 'flex flex-col',
		'blog-list-icon': 'shrink-0 size-5 ',
	},
});

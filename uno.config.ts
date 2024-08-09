import { isDevelopment } from 'std-env';
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
	theme: {
		colors: {
			'primary-100': '#FF6B6B',
			'primary-200': '#dd4d51',
			'primary-300': '#8f001a',
			'accent-100': '#FFE66D',
			'accent-200': '#958500',
			'text-100': '#FFFFFF',
			'text-200': '#e0e0e0',
			'bg-100': '#1E1E1E',
			'bg-200': '#2d2d2d',
			'bg-300': '#454545',
		},
		breakpoints: {
			tiny: '375px',
		},
	},
	rules: [
	],
	shortcuts: {
	},
});

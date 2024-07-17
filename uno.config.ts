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
		presetAttributify({ prefix: 'uno-', prefixedOnly: true }),
		presetIcons({ autoInstall: isDevelopment }),
	],
	transformers: [
		transformerDirectives(),
		transformerVariantGroup(),
	],
	theme: {
		colors: {
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

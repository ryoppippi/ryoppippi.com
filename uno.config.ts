import { isDevelopment } from 'std-env';
import { deepMerge } from '@std/collections/deep-merge';
import {
	defineConfig,
	presetAttributify,
	presetIcons,
	presetTypography,
	presetUno,
	presetWebFonts,
	transformerDirectives,
	transformerVariantGroup,
} from 'unocss';

import { presetFluid } from 'unocss-preset-fluid';

// TODO: bug of unocss
import ossProjects from './src/contents/projects/oss/list.js';

const projectSafelist: string[] = [];
Object.values(ossProjects).forEach((projects) => {
	projectSafelist.push(...projects.map(project => project.icon));
});

export default defineConfig({
	presets: [
		presetUno(),
		presetAttributify(),
		presetIcons({ autoInstall: isDevelopment }),
		presetWebFonts({
			provider: 'bunny',
			fonts: {
				sans: 'Inter:400,600,800',
				mono: 'DM Mono:400,600',
				condensed: 'Roboto Condensed',
				wisper: 'Bad Script',
			},
		}),
		presetTypography(),
		presetFluid(),
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
		// eslint-disable-next-line ts/no-unsafe-argument
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
	shortcuts: [
		{
			'fcol': 'flex flex-col',
			'fw': 'flex flex-wrap',
			'fxc': 'flex justify-center',
			'fyc': 'flex items-center',
			'fcc': 'fxc fyc',
			'gc': 'grid place-content-center',
			'gcc': 'gc place-items-center',
			'blog-list-icon': 'shrink-0 size-5 ',
			'border-base': 'border-[#8884]',
			'prose-base': 'prose dark:prose-invert',
			'op-card': 'op70 dark:op50 hover:op80 group-hover:op80',
		},
		[/^btn-(\w+)$/, ([_, color]) => `op50 px2.5 py1 transition-all duration-200 ease-out no-underline! hover:(op100 text-${color} bg-${color}/10) border border-base! rounded`],
		[/^fcol-(\w+)-row$/, ([_, size]) => `fcol ${size}:flex-row`],
		[/^gcc-(\w+)$/, ([_, flowDirection]) => `gcc grid-flow-${flowDirection}`],
	],
	safelist: [...projectSafelist],
});

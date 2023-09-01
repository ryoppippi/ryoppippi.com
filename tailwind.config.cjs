// @ts-check

import { join } from 'path';
import { skeleton } from '@skeletonlabs/tw-plugin';
import { ryoppippiTheme } from './theme.js';

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	plugins: [
		require('@tailwindcss/typography'),
		skeleton({
			themes: {
				custom: [ryoppippiTheme]
			}
		})
		// require('daisyui')
	],
	theme: {
		extend: {
			colors: {
				me: {
					'primary-100': '#FF6B6B',
					'primary-200': '#dd4d51',
					'primary-300': '#8f001a',
					'accent-100': '#FFE66D',
					'accent-200': '#958500',
					'text-100': '#FFFFFF',
					'text-200': '#e0e0e0',
					'bg-100': '#1E1E1E',
					'bg-200': '#2d2d2d',
					'bg-300': '#454545'
				}
			}
		}
	}
	// daisyui: {
	// 	logs: false,
	// 	themes: [
	// 		{
	// 			ryoppippi: {
	// 				primary: '#FF6B6B',
	// 				secondary: '#dd4d51',
	// 				accent: '#FFE66D',
	// 				neutral: '#191D24',
	// 				'base-100': '#1E1E1E',
	// 				info: '#3ABFF8',
	// 				success: '#36D399',
	// 				warning: '#FBBD23',
	// 				error: '#F87272'
	// 			}
	// 		}
	// 	]
	// },
};

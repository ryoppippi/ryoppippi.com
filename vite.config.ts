import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	publicDir: 'static',
	plugins: [svelte(), tailwindcss()],
	build: {
		outDir: 'build',
		emptyOutDir: true,
	},
	test: {
		globals: true,
		environment: 'node',
		includeSource: ['src/lib/**/*.ts', 'src/markdown/**/*.ts', 'src/site/**/*.ts'],
	},
});

import { defineConfig } from 'vite-plus';

export default defineConfig({
	run: {
		tasks: {
			build: {
				command: 'bun scripts/build.ts',
				input: [
					'package.json',
					'vite.config.ts',
					'scripts/**',
					'src/**',
					{ pattern: '.cache/ox-content/twitter/**', base: 'workspace' },
					{ pattern: 'pnpm-lock.yaml', base: 'workspace' },
				],
				output: ['dist/**'],
			},
		},
	},
});

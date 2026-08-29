import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'browser',
		globals: true,
		include: ['src/**/*.browser.test.ts'],
		browser: {
			enabled: true,
			headless: true,
			provider: playwright({
				contextOptions: {
					permissions: ['clipboard-read', 'clipboard-write'],
				},
			}),
			instances: [{ browser: 'chromium' }],
		},
	},
});

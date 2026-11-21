import { defineConfig } from 'cf/config';

export default defineConfig({
	worker: {
		name: 'ryoppippi-com',
		compatibilityDate: '2025-06-19',
		assets: {
			htmlHandling: 'auto-trailing-slash',
			notFoundHandling: '404-page',
		},
	},
});

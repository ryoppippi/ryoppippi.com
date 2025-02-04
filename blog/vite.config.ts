import Typia from '@ryoppippi/unplugin-typia/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		Typia({}),
		sveltekit(),
	],
});

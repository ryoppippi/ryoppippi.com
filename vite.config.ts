import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [enhancedImages(), sveltekit(), Icons({ compiler: 'svelte', autoInstall: true })]
});

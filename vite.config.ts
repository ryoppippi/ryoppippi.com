import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import Macros from '@unplugin/macros/vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [enhancedImages(), Macros(), sveltekit(), Icons({ compiler: 'svelte', autoInstall: true })]
});

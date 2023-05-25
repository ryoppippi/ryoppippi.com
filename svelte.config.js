import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/kit/vite';
// import { importAssets } from 'svelte-preprocess-import-assets';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSlug from 'rehype-slug';

const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],

	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [
		vitePreprocess()
		// importAssets(),
		// mdsvex({
		// 	extensions: ['.md'],
		// 	rehypePlugins: [
		// 		[
		// 			rehypeExternalLinks,
		// 			{
		// 				/**
		// 				 * @function
		// 				 * @param {HTMLLinkElement} el
		// 				 * @returns {string | undefined}
		// 				 */
		// 				target: (el) => (el.properties?.href?.startsWith('http') ? '_blank' : undefined)
		// 			}
		// 		],
		// 		[rehypeSlug, {}],
		// 		[rehypeAutolinkHeadings, {}]
		// 	]
		// })
	],

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			precompress: true
		})
	},
	vitePlugin: {
		inspector: dev
	}
};

export default config;

declare namespace svelteHTML {
	import type { AttributifyAttributes } from '@unocss/preset-attributify';

  type HTMLAttributes = AttributifyAttributes;
}

declare module 'svelte/elements' {
	export type SvelteHTMLElements = {
		'enhanced:img': EnhancedImgAttributes & AttributifyAttributes;
	};
}

declare namespace svelteHTML {
	import type { AttributifyAttributes } from '@unocss/preset-attributify';

	type HTMLAttributes = AttributifyAttributes;
}

declare module '*?enhanced&w=400' {
	import type { Picture } from 'vite-imagetools';

	const value: Picture;
	export default value;
}

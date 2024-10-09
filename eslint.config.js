import { ryoppippi } from '@ryoppippi/eslint-config';

export default ryoppippi({
	tailwind: false,
	svelte: true,
	astro: true,
	ignores: ['sveltekit'],
	typescript: {
		tsconfigPath: './tsconfig.json',
	},
});

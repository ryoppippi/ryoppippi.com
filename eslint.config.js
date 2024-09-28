import { ryoppippi } from '@ryoppippi/eslint-config';

export default ryoppippi({
	tailwind: false,
	svelte: true,
	ignores: ['src/contents/**/*.md'],
	typescript: {
		tsconfigPath: './tsconfig.json',
	},
});

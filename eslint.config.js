import { ryoppippi } from '@ryoppippi/eslint-config';

export default ryoppippi({
	type: 'app',
	unocss: true,
	svelte: true,
	typescript: {
		tsconfigPath: './tsconfig.json',
	},
});

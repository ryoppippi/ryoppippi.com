import { ryoppippi } from '@ryoppippi/eslint-config';

export default ryoppippi({
	type: 'app',
	tailwind: false,
	svelte: true,
	typescript: {
		tsconfigPath: './tsconfig.json',
	},
});

import { ryoppippi } from '@ryoppippi/eslint-config';

export default ryoppippi({
	tailwind: false,
	svelte: true,
	typescript: {
		tsconfigPath: './tsconfig.json',
	},
});

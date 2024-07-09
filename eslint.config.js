import { ryoppippi } from '@ryoppippi/eslint-config';

export default ryoppippi({
	tailwind: true,
	rules: {
		'eslint-comments/no-unlimited-disable': 'off',
	},
	typescript: {
		tsconfigPath: './tsconfig.json',
	},
});

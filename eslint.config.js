import { ryoppippi } from '@ryoppippi/eslint-config';

export default ryoppippi({
	tailwind: false,
	typescript: {
		tsconfigPath: './tsconfig.json',
	},
});

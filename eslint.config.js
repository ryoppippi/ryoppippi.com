import { ryoppippi } from '@ryoppippi/eslint-config';

export default ryoppippi({
	tailwind: true,
	typescript: {
		tsconfigPath: './tsconfig.json',
	},
});

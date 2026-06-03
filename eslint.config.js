import { ryoppippi } from '@ryoppippi/eslint-config';

export default ryoppippi({
	type: 'app',
	svelte: true,
	typescript: {
		tsconfigPath: './tsconfig.json',
	},
	ignores: [
		'.ox-content-compare/**',
		// Migrated Zenn blog posts with legacy code formatting
		'src/contents/blog/*-zenn-*-ja/index.md',
	],
}, {
	rules: {
		'antfu/no-top-level-await': 'off',
	},
});

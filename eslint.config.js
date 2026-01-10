import { ryoppippi } from '@ryoppippi/eslint-config';

export default ryoppippi({
	type: 'app',
	unocss: true,
	svelte: true,
	typescript: {
		tsconfigPath: './tsconfig.json',
	},
	ignores: [
		// Migrated Zenn blog posts (date-hash format, e.g. 2024-06-12-c4775a3a5f3c11-ja.md)
		'src/contents/blog/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]-ja.md',
	],
}, {
	rules: {
		'antfu/no-top-level-await': 'off',
	},
});

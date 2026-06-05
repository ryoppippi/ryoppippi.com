import plugin from 'tailwindcss/plugin';

import { fontAssets } from './font-assets.js';

export default plugin(({ addBase }) => {
	addBase(
		fontAssets.map(({ family, fileName, weight }) => ({
			'@font-face': {
				fontFamily: family,
				fontStyle: 'normal',
				fontDisplay: 'swap',
				fontWeight: weight,
				src: `url('/fonts/${fileName}') format('woff2')`,
			},
		})),
	);
});

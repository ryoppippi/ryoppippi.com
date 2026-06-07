import plugin from 'tailwindcss/plugin';

import { fontAssets } from './font-assets.ts';

export default plugin((api) => {
	api.addBase({
		'@font-face': fontAssets.map(({ family, fileName, weight }) => ({
			fontFamily: family,
			fontStyle: 'normal',
			fontDisplay: 'swap',
			fontWeight: String(weight),
			src: `url('/fonts/${fileName}') format('woff2')`,
		})),
	});
});

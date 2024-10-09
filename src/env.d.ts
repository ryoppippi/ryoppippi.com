/// <reference path="../.astro/types.d.ts" />
namespace astroHTML.JSX {
	import type { AttributifyAttributes } from '@unocss/preset-attributify';

	// eslint-disable-next-line ts/consistent-type-definitions
	interface HTMLAttributes extends AttributifyAttributes {
		[key: string]: any;
	}
}

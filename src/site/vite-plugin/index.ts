import type { Plugin } from 'vite';
import { staticSiteBuildPlugin } from './build.ts';
import { staticSiteDevelopmentPlugin } from './development.ts';

/**
 * Creates the Vite plugins that serve and generate the custom static site.
 *
 * @returns The development and production plugins for the static-site lifecycle.
 */
export function staticSite(): Plugin[] {
	return [staticSiteBuildPlugin(), staticSiteDevelopmentPlugin()];
}

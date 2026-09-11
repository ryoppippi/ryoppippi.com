import type {
	OxContentCustomHostAssetsContext,
	OxContentCustomHostStylesheetsResult,
} from '@ox-content/vite-plugin/custom-host';
import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import { inlineHomeStyles } from '@/components/SiteLayout/assets.ts';

/** Inlines the homepage's critical CSS while leaving other pages' styles linked. */
export async function inlineBuiltHomeStyles(
	resolver: OxContentCustomHostAssetsContext,
	assets: SiteAssets,
): Promise<SiteAssets> {
	async function content(results: OxContentCustomHostStylesheetsResult[]) {
		const diagnostics = results.flatMap((result) => result.diagnostics);
		if (diagnostics.length > 0)
			throw new Error(diagnostics.map(({ message }) => message).join('\n'));
		const result = await resolver.stylesheetContent({
			stylesheets: results.flatMap((result) => result.stylesheets),
		});
		if (result.diagnostics.length > 0)
			throw new Error(result.diagnostics.map(({ message }) => message).join('\n'));
		if (result.stylesheets.length === 0)
			throw new Error('Missing CSS assets for inline home styles');
		return result.stylesheets.map(({ content }) => content).join('\n');
	}
	const base = await content([resolver.stylesheets({ modules: ['index.html'] })]);
	const page = await content([
		resolver.ssrStylesheets({
			modules: ['/src/pages/Home.svelte', '/src/components/SiteLayout/index.svelte'],
		}),
	]);
	return inlineHomeStyles(assets, base, page);
}

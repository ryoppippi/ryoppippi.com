import type { DocumentStylesheetInput } from '@ox-content/vite-plugin/document-assets';
import type { SiteAssets } from '@/components/SiteLayout/assets.ts';
import { inlineHomeStyles } from '@/components/SiteLayout/assets.ts';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { withoutLeadingSlash } from 'ufo';

function linkedStylesheets(stylesheets: readonly DocumentStylesheetInput[]): string[] {
	return stylesheets.flatMap((stylesheet) => {
		if (typeof stylesheet === 'string') return [stylesheet];
		return stylesheet.href == null ? [] : [stylesheet.href];
	});
}

/** Inlines the homepage's critical CSS while leaving other pages' styles linked. */
export async function inlineBuiltHomeStyles(
	outDir: string,
	assets: SiteAssets,
): Promise<SiteAssets> {
	const baseFiles = linkedStylesheets(assets.sharedStyles);
	const homeFiles = linkedStylesheets(assets.pageStyles.home);
	if (baseFiles.length === 0 || homeFiles.length === 0) {
		throw new Error('Missing CSS assets for inline home styles');
	}
	const readCssFiles = (files: readonly string[]) =>
		Promise.all(
			files.map((file) => readFile(path.join(outDir, withoutLeadingSlash(file)), 'utf8')),
		).then((contents) => contents.join('\n'));
	const [base, home] = await Promise.all([
		readCssFiles([...new Set(baseFiles)]),
		readCssFiles(homeFiles),
	]);
	return inlineHomeStyles(assets, base, home);
}
